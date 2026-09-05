import { CodeBlock } from './CodeBlock';

function GitHubLink() {
  return (
    <a className="github-link" href="https://github.com/adnfng/no-author" target="_blank" rel="noreferrer" aria-label="View Noa on GitHub">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>
    </a>
  );
}

function InstallationSection() {
  return (
    <section className="guide-section" id="installation">
      <div className="section-heading-row"><h2>Install once. Forget about it.</h2><GitHubLink /></div>
      <p>One command covers every Git repository on your machine:</p>
      <CodeBlock language="shell">npx no-author install --global</CodeBlock>
      <p>Want to use it in this repository only?</p>
      <CodeBlock language="shell">npx no-author install</CodeBlock>
      <p>Already have suspicious trailers in your history?</p>
      <CodeBlock language="shell">npx no-author check</CodeBlock>
      <p>That's it. Commit as usual. Noa removes AI attribution before Git writes the commit.</p>
    </section>
  );
}

function SuspectsSection() {
  return (
    <section className="guide-section" id="usual-suspects">
      <h2>It knows the usual suspects.</h2>
      <p>Cursor, Claude Code, Codex, Gemini, Aider, and Copilot all add their own signatures. Noa recognizes the bot emails and removes them. Human co-authors stay put.</p>
      <p>If your coding agent won't give you an off switch, Noa will.</p>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="guide-section" id="privacy">
      <h2>Nothing leaves your machine. Just a number.</h2>
      <p>The counter at the top goes up when Noa cleans a commit. That's the whole request. It contains no code, commit messages, repository names, usernames, or identities. If the request fails, Noa tries again after a later commit.</p>
      <p>Don't want to report it? Turn it off:</p>
      <CodeBlock language="json">{`{
  "telemetry": false
}`}</CodeBlock>
    </section>
  );
}

export function UsageGuide() {
  return (
    <div className="site-guide">
      <InstallationSection />
      <SuspectsSection />
      <PrivacySection />
    </div>
  );
}
