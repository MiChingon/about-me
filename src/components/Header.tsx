import { useEffect, useState } from 'react';
import { Github, Linkedin, Mail, Menu, X } from 'lucide-react';
import { profile } from '../data/profile';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];

const SOCIAL_ICON = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
};

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? 'border-b border-white/5 bg-ink-950/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/30">
            FA
          </span>
          <span className="hidden sm:inline">{profile.shortName}.dev</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="link-underline text-sm">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {profile.socials.map((s) => {
            const Icon = SOCIAL_ICON[s.icon];
            return (
              <a
                key={s.label}
                href={s.href}
                target={s.icon === 'mail' ? undefined : '_blank'}
                rel="noreferrer"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-accent/40 hover:text-accent"
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-ink-950/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4 sm:px-8">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
