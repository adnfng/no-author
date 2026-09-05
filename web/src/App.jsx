import { Hero } from './components/Hero';
import { UsageGuide } from './components/UsageGuide';

export default function App() {
  return (
    <main className="site-page">
      <div className="site-column">
        <Hero />
        <UsageGuide />
      </div>
    </main>
  );
}
