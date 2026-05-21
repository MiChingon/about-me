import { Briefcase, MapPin } from 'lucide-react';
import { profile } from '../data/profile';

export function Experience() {
  return (
    <section id="experience" className="section">
      <span className="section-eyebrow">
        <Briefcase size={14} />
        Professional experience
      </span>
      <h2 className="section-title">Where I've worked.</h2>
      <p className="section-subtitle">
        Nine plus years across product teams in agency and consultancy settings.
      </p>

      <ol className="relative mt-12 space-y-10 border-l border-white/10 pl-8">
        {profile.experiences.map((exp) => (
          <li key={`${exp.company}-${exp.startDate}`} className="relative">
            <span className="absolute -left-[37px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink-900 ring-2 ring-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>

            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold text-white">
                {exp.role}{' '}
                <span className="text-slate-500">@</span>{' '}
                <span className="text-accent">{exp.company}</span>
              </h3>
              <span className="font-mono text-xs text-slate-400">
                {exp.startDate} — {exp.endDate}
              </span>
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin size={12} />
              {exp.location}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {exp.highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
