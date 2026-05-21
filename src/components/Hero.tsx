import { ArrowRight, MapPin } from 'lucide-react';
import { profile } from '../data/profile';

const TONE_DOT: Record<'green' | 'amber' | 'cyan', string> = {
  green: 'bg-emerald-500 dark:bg-emerald-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  cyan: 'bg-accent',
};

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="section pt-32 sm:pt-36">
        <div className="animate-fade-in-up">
          <span className="chip">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-emerald-500 opacity-75 dark:bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            </span>
            Available for new projects
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Hi, I'm <span className="text-cyan-700 dark:text-accent">{profile.name}</span>.
            <br />
            <span className="text-slate-700 dark:text-slate-300">{profile.role}.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {profile.intro}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-accent-soft"
            >
              Get in touch
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#experience"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              See my experience
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-cyan-700 dark:text-accent" />
              {profile.location}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            {profile.status.map((s, i) => (
              <span key={s.label} className="inline-flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[s.tone]}`} />
                {s.label}
                {i < profile.status.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
