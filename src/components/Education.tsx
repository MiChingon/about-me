import { GraduationCap, Languages } from 'lucide-react';
import { profile } from '../data/profile';

export function Education() {
  return (
    <section id="education" className="section">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <span className="section-eyebrow">
            <GraduationCap size={14} />
            Education
          </span>
          <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            {profile.education.school}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile.education.degree}</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{profile.education.field}</p>
        </div>

        <div className="card">
          <span className="section-eyebrow">
            <Languages size={14} />
            Languages
          </span>
          <ul className="mt-4 space-y-4">
            {profile.languages.map((lang) => (
              <li key={lang.name}>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">{lang.name}</span>
                  <span className="font-mono text-xs text-cyan-700 dark:text-accent">{lang.level}</span>
                </div>
                {lang.notes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {lang.notes.map((n) => (
                      <li key={n} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
