import { useEffect, useState } from 'react';
import { NumberTicker } from './NumberTicker';

const STATS_ENDPOINT = 'https://no-author.vercel.app/api/stats';
const POLL_INTERVAL = 5_000;

function parseCleanedCommitCount(data) {
  const count = data && data.fixedCommits;
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

async function fetchCleanedCommitCount(signal) {
  const response = await fetch(STATS_ENDPOINT, { signal, cache: 'no-store' });
  if (!response.ok) return null;

  return parseCleanedCommitCount(await response.json());
}

function useCleanedCommitCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    function updateCount() {
      fetchCleanedCommitCount(controller.signal)
        .then((nextCount) => {
          if (nextCount == null) return;
          setCount(nextCount);
        })
        .catch((error) => {
          if (error?.name === 'AbortError') return;
        });
    }

    updateCount();
    const timer = window.setInterval(updateCount, POLL_INTERVAL);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  return count;
}

export function Hero() {
  const count = useCleanedCommitCount();
  const formattedCount = count.toLocaleString('en-US');

  return (
    <header className="site-hero">
      <a className="site-logo-link" href="/" aria-label="Noa home">
        <img className="site-logo" src="/clanker.png" alt="" width="724" height="543" />
      </a>
      <h1 aria-label={`${formattedCount} clankers have tried to sign the commit.`}>
        <span className="site-hero-line">
          <NumberTicker
            className="live-count"
            value={count}
            startValue={0}
            aria-hidden="true"
          />{' '}
          clankers have tried
        </span>
        <span className="site-hero-line">to sign the commit.</span>
      </h1>
    </header>
  );
}
