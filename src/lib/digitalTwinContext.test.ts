import { describe, expect, it } from 'vitest';
import { buildDigitalTwinSystemPrompt, DIGITAL_TWIN_MODEL } from './digitalTwinContext';
import { profile } from '../data/profile';

describe('buildDigitalTwinSystemPrompt', () => {
  it('includes core profile facts', () => {
    const prompt = buildDigitalTwinSystemPrompt();
    expect(prompt).toContain(profile.name);
    expect(prompt).toContain('3Pillar Global');
    expect(prompt).toContain('Senior Software Engineer');
    expect(prompt).toContain('Universidad Tecnológica de Jalisco');
  });

  it('instructs the model to stay grounded in provided facts', () => {
    const prompt = buildDigitalTwinSystemPrompt();
    expect(prompt.toLowerCase()).toContain('only');
    expect(prompt).toContain('first person');
  });
});

describe('DIGITAL_TWIN_MODEL', () => {
  it('uses the requested OpenRouter model', () => {
    expect(DIGITAL_TWIN_MODEL).toBe('openai/gpt-oss-120b:free');
  });
});
