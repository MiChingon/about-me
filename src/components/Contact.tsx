import { ArrowUpRight, Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { profile } from '../data/profile';

const ICON = { mail: Mail, github: Github, linkedin: Linkedin };

export function Contact() {
  return (
    <section id="contact" className="section">
      <div className="card !p-6 sm:!p-10 md:!p-14">
        <span className="section-eyebrow">
          <MessageCircle size={14} />
          Get in touch
        </span>
        <h2 className="section-title">Let's build something together.</h2>
        <p className="section-subtitle">
          I'm currently open to new opportunities — full-time roles or contract work. Reach out and
          I'll get back to you within a couple of days.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {profile.socials.map((s) => {
            const Icon = ICON[s.icon];
            return (
              <a
                key={s.label}
                href={s.href}
                target={s.icon === 'mail' ? undefined : '_blank'}
                rel="noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 transition hover:border-accent/40 hover:bg-slate-50 sm:px-5 dark:border-white/10 dark:bg-white/5 dark:hover:border-accent/40 dark:hover:bg-white/10"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon size={18} className="shrink-0 text-cyan-700 dark:text-accent" />
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {s.label}
                    </span>
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                      {s.handle}
                    </span>
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-700 dark:text-slate-400 dark:group-hover:text-accent"
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
