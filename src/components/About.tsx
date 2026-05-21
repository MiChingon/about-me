import { Sparkles } from 'lucide-react';
import { profile } from '../data/profile';

export function About() {
  return (
    <section id="about" className="section">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="section-eyebrow">
            <Sparkles size={14} />
            About me
          </span>
          <h2 className="section-title">A pragmatic engineer who ships.</h2>
          <p className="section-subtitle">{profile.tagline}</p>

          <div className="mt-8 space-y-4 text-slate-300">
            {profile.about.map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
          </div>
        </div>

        <aside className="card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">Highlights</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {profile.highlights.map((h) => (
              <li key={h} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
