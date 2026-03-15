export const EFFORT_TIERS = {
  low: { label: 'Quick' },
  medium: { label: 'Standard' },
  high: { label: 'Deep' },
};

export const AI_WRITER_TOOLS = [
  {
    id: 'logline-builder',
    name: 'Logline Builder',
    description: 'Craft a compelling one-sentence pitch for your story.',
    effortTier: 'low',
  },
  {
    id: 'script-polisher',
    name: 'Script Polisher',
    description: 'Refine dialogue, pacing, and clarity in your script.',
    effortTier: 'medium',
  },
  {
    id: 'scene-builder',
    name: 'Scene Builder',
    description: 'Structure and develop individual scenes with clear beats.',
    effortTier: 'medium',
  },
  {
    id: 'concept-deepener',
    name: 'Concept Deepener',
    description: 'Expand and deepen your story concept and themes.',
    effortTier: 'medium',
  },
  {
    id: 'originality-checker',
    name: 'Originality Checker',
    description: 'Assess uniqueness and suggest ways to differentiate your work.',
    effortTier: 'high',
  },
  {
    id: 'pitch-builder',
    name: 'Pitch Builder',
    description: 'Build a full pitch deck narrative for investors or studios.',
    effortTier: 'high',
  },
];

export function getToolById(id) {
  return AI_WRITER_TOOLS.find((t) => t.id === id) ?? null;
}
