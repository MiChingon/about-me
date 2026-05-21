import { profile } from '../data/profile';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:px-8">
        <p>
          © {year} {profile.name}. Crafted with React, TypeScript &amp; Tailwind.
        </p>
        <p className="font-mono text-xs">
          Designed and built in <span className="text-accent">{profile.location}</span>.
        </p>
      </div>
    </footer>
  );
}
