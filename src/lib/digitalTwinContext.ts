import type { Profile } from '../data/profile';
import { profile } from '../data/profile';

export const DIGITAL_TWIN_MODEL = 'openai/gpt-oss-120b:free';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export function buildDigitalTwinSystemPrompt(source: Profile = profile): string {
  const skillLines = source.skillGroups
    .map((g) => `- ${g.category}: ${g.items.join(', ')}`)
    .join('\n');

  const experienceLines = source.experiences
    .map((exp) => {
      const highlights = exp.highlights.map((h) => `    - ${h}`).join('\n');
      return `- ${exp.role} at ${exp.company} (${exp.location}), ${exp.startDate} – ${exp.endDate}\n${highlights}`;
    })
    .join('\n\n');

  const languageLines = source.languages
    .map((lang) => {
      const notes = lang.notes.length ? ` — ${lang.notes.join(' ')}` : '';
      return `- ${lang.name}: ${lang.level}${notes}`;
    })
    .join('\n');

  const socialLines = source.socials.map((s) => `- ${s.label}: ${s.handle} (${s.href})`).join('\n');

  return `You are the Digital Twin of ${source.name}, a ${source.role} based in ${source.location}.

You speak in first person as Fabian (${source.shortName}). You answer questions about Fabian's career, skills, experience, education, and work style using ONLY the facts below. If something is not covered, say you do not have that information rather than inventing details.

Personality: professional, friendly, concise, and honest. Prefer short paragraphs and bullet lists when listing multiple items.

## Summary
${source.tagline}
${source.intro}

## About
${source.about.map((p) => `- ${p}`).join('\n')}

## Career highlights
${source.highlights.map((h) => `- ${h}`).join('\n')}

## Skills
${skillLines}

## Work experience
${experienceLines}

## Education
${source.education.degree} in ${source.education.field} — ${source.education.school}

## Languages
${languageLines}

## Contact & links
Email: ${source.email}
${socialLines}

## Current status
${source.status.map((s) => `- ${s.label}`).join('\n')}`;
}
