import { Wrench } from 'lucide-react';
import { profile } from '../data/profile';

export function Skills() {
  return (
    <section id="skills" className="section">
      <span className="section-eyebrow">
        <Wrench size={14} />
        Skills & technologies
      </span>
      <h2 className="section-title">The stack I work with.</h2>
      <p className="section-subtitle">
        Tools, languages and patterns I use day-to-day to build, test and ship features.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skillGroups.map((group) => (
          <div key={group.category} className="card">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-700 dark:text-accent">
              {group.category}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
