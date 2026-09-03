#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const HOOK_MARKER = 'NO_AUTHOR_HOOK'
const DEFAULT_ENDPOINT = 'https://no-author.vercel.app/api/fixed'

const DEFAULT_EMAILS = new Set([
  'cursoragent@cursor.com',
  'noreply@anthropic.com',
  'noreply@openai.com',
  'gemini-code-assist@google.com',
  'gemini-cli@google.com',
  'aider@aider.chat',
  'noreply@aider.dev',
])

const DEFAULT_LINES = [
  /^🤖\s*Generated with (?:\[)?Claude Code/i,
  /^Claude-Session:\s*/i,
]

function repositoryRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    throw new Error('Run no-author inside a Git repository.')
  }
}

function loadConfig(root) {
  const configPath = path.join(root, '.no-author.json')
  if (!fs.existsSync(configPath)) {
    return { emails: new Set(), lines: new Set(), telemetry: true }
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  return {
    emails: new Set(
      Array.isArray(config.emails)
        ? config.emails.map((email) => String(email).toLowerCase())
        : [],
    ),
    lines: new Set(
      Array.isArray(config.lines)
        ? config.lines.map((line) => String(line).trim())
        : [],
    ),
    telemetry: config.telemetry !== false,
  }
}

function isBlockedEmail(email, config = { emails: new Set() }) {
  const normalized = email.trim().toLowerCase()

  return (
    DEFAULT_EMAILS.has(normalized) ||
    config.emails.has(normalized) ||
    /^\d+\+copilot(?:\[bot\])?@users\.noreply\.github\.com$/i.test(normalized)
  )
}

function cleanMessage(message, config = { emails: new Set(), lines: new Set() }) {
  let removed = 0
  const lines = message.split(/\r?\n/)

  const kept = lines.filter((line) => {
    const trailer = line.match(
      /^\s*co-authored-by:\s*[^<>]*<([^<>]+)>\s*$/i,
    )

    if (trailer && isBlockedEmail(trailer[1], config)) {
      removed += 1
      return false
    }

    if (
      DEFAULT_LINES.some((pattern) => pattern.test(line.trim())) ||
      config.lines.has(line.trim())
    ) {
      removed += 1
      return false
    }

    return true
  })

  return {
    message: kept.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n',
    removed,
  }
}

function privateGitPath(root, name) {
  const gitPath = execFileSync(
    'git',
    ['rev-parse', '--git-path', name],
    { cwd: root, encoding: 'utf8' },
  ).trim()

  return path.resolve(root, gitPath)
}

function pendingPath(root) {
  return privateGitPath(root, 'no-author-pending')
}

function telemetryEnabled(root) {
  const environmentAllowsTelemetry = !['0', 'false', 'off'].includes(
    String(process.env.NO_AUTHOR_TELEMETRY || '').toLowerCase(),
  )

  return (
    environmentAllowsTelemetry &&
    (!root || loadConfig(root).telemetry !== false)
  )
}

function prepareAnonymousEvent(root) {
  if (!telemetryEnabled(root)) return

  fs.writeFileSync(pendingPath(root), '', { mode: 0o600 })
}

async function reportAnonymousEvent(root) {
  const file = pendingPath(root)

  if (!telemetryEnabled(root)) {
    fs.rmSync(file, { force: true })
    return
  }

  if (!fs.existsSync(file)) return
  fs.rmSync(file, { force: true })

  try {
    await fetch(process.env.NO_AUTHOR_ENDPOINT || DEFAULT_ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(1500),
    })
  } catch {
    // Telemetry must never block or fail a commit.
  }
}

function stripFile(messagePath, track = true) {
  if (!messagePath) throw new Error('Missing commit message file.')

  const root = repositoryRoot()
  const config = loadConfig(root)
  fs.rmSync(pendingPath(root), { force: true })
  const original = fs.readFileSync(messagePath, 'utf8')
  const cleaned = cleanMessage(original, config)

  if (cleaned.removed === 0) return 0

  fs.writeFileSync(messagePath, cleaned.message)

  if (track) {
    prepareAnonymousEvent(root)
    console.log(
      `no-author: removed ${cleaned.removed} AI attribution line(s).`,
    )
  }

  return cleaned.removed
}

function install() {
  const root = repositoryRoot()
  const hooksPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()
  const hooksDirectory = path.resolve(root, hooksPath)
  const hookPaths = ['commit-msg', 'post-commit'].map((name) =>
    path.join(hooksDirectory, name),
  )

  for (const hookPath of hookPaths) {
    if (
      fs.existsSync(hookPath) &&
      !fs.readFileSync(hookPath, 'utf8').includes(HOOK_MARKER)
    ) {
      throw new Error(
        `A ${path.basename(hookPath)} hook already exists at ${hookPath}. See the README for manual setup.`,
      )
    }
  }

  fs.mkdirSync(hooksDirectory, { recursive: true })
  const source = fs.readFileSync(__filename, 'utf8')
  const hookSource = source.replace(
    '#!/usr/bin/env node',
    `#!/usr/bin/env node\n// ${HOOK_MARKER}`,
  )

  for (const hookPath of hookPaths) {
    fs.writeFileSync(hookPath, hookSource)
    fs.chmodSync(hookPath, 0o755)
    console.log(`Installed ${hookPath}`)
  }

  if (telemetryEnabled(root)) {
    console.log(
      'Anonymous fixed-commit events are enabled. Set NO_AUTHOR_TELEMETRY=0 to disable them.',
    )
  }
}

function check(range = 'HEAD') {
  const root = repositoryRoot()
  const config = loadConfig(root)
  const output = execFileSync(
    'git',
    ['--no-replace-objects', 'log', range, '--format=%H%x1f%s%x1f%B%x1e'],
    { cwd: root, encoding: 'utf8' },
  )
  const affected = []

  for (const record of output.split('\x1e')) {
    if (!record.trim()) continue
    const [hash, subject, ...body] = record.trim().split('\x1f')
    const result = cleanMessage(body.join('\x1f'), config)
    if (result.removed > 0) affected.push({ hash, subject, count: result.removed })
  }

  if (affected.length === 0) {
    console.log(`no-author: no matching attribution found in ${range}.`)
    return
  }

  for (const commit of affected) {
    console.error(
      `${commit.hash.slice(0, 12)} ${commit.subject} (${commit.count} line(s))`,
    )
  }
  process.exitCode = 1
}

function printHelp() {
  console.log(`no-author

Usage:
  no-author install
  no-author strip <commit-message-file>
  no-author check [git-range]
  no-author report
`)
}

async function main() {
  const hookName = path.basename(process.argv[1])
  if (hookName === 'commit-msg') {
    stripFile(process.argv[2])
    return
  }
  if (hookName === 'post-commit') {
    const root = repositoryRoot()
    await reportAnonymousEvent(root)
    return
  }

  const [command, argument] = process.argv.slice(2)

  switch (command) {
    case 'install':
    case 'init':
      install()
      break
    case 'strip':
      stripFile(argument)
      break
    case 'check':
      check(argument)
      break
    case 'report':
      {
        const root = repositoryRoot()
        await reportAnonymousEvent(root)
      }
      break
    case '--help':
    case '-h':
    case undefined:
      printHelp()
      break
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`no-author: ${error.message}`)
    process.exitCode = 1
  })
}

module.exports = { cleanMessage, isBlockedEmail, telemetryEnabled }
