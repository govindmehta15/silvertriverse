import { getData, updateData, simulateApi } from './storageService';

const HISTORY_KEY = 'silvertriverse_ai_writer_history';

const MOCK_ANALYSES = [
  {
    structure: 'Clear three-act feel with a strong midpoint.',
    tone: 'Atmospheric and tense with moments of dry humor.',
    strengths: ['Strong hook in the opening', 'Clear protagonist goal', 'Distinct voice'],
    suggestions: ['Consider sharpening the antagonist motive', 'Add one concrete sensory detail in the logline'],
  },
  {
    structure: 'Solid setup–confrontation–resolution arc; the second act could use one clearer turning point.',
    tone: 'Warm and character-driven, with rising stakes.',
    strengths: ['Relatable protagonist', 'Clear thematic throughline', 'Memorable setting'],
    suggestions: ['Tighten the inciting incident', 'One more beat of internal conflict before the climax'],
  },
];

const MOCK_VARIANTS_BY_TOOL = {
  'logline-builder': [
    'A high-concept version that leads with the central conflict.',
    'A character-first version that emphasizes the protagonist’s flaw.',
    'A genre-forward version that highlights the thriller/sci-fi hook.',
  ],
  'script-polisher': [
    'Tighter dialogue and clearer subtext in key exchanges.',
    'Stronger scene transitions and a clearer act-two spine.',
    'More specific imagery and one recurring visual motif.',
  ],
  'scene-builder': [
    'Three-beat structure: Setup, Complication, Resolution.',
    'Five-beat structure with a mid-scene reversal.',
    'Emotion-led structure: Start with feeling, land on decision.',
  ],
  'concept-deepener': [
    'Theme: Identity and sacrifice. Layers: moral cost, legacy.',
    'Theme: Truth and performance. Layers: public vs private self.',
    'Theme: Control and chaos. Layers: order, rebellion, acceptance.',
  ],
  'originality-checker': [
    'Originality score: 78%. Distinct: premise and setting. Differentiate the third-act twist.',
    'Originality score: 82%. Strong voice; consider a bolder genre blend.',
    'Originality score: 71%. Character relationships feel fresh; premise has echoes—add a unique constraint.',
  ],
  'pitch-builder': [
    'HOOK → LOGLINE → STAKES → TONE → COMPARABLES → WHY NOW → TEAM.',
    'Emotional hook first, then world, then character, then conflict.',
    'One-sentence opener, then three-act summary, then market angle.',
  ],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockOutput(toolId, inputText) {
  const snippet = (inputText || 'your content').slice(0, 80);
  switch (toolId) {
    case 'logline-builder':
      return `When ${snippet}… a reluctant hero must confront the past before everything they love is lost.`;
    case 'script-polisher':
      return `[Polished draft]\n\n${snippet}…\n\nTightened dialogue and clearer beats. Pacing improved in the second half.`;
    case 'scene-builder':
      return `INT. LOCATION - DAY\n\n${snippet}…\n\nBeat 1: Setup\nBeat 2: Complication\nBeat 3: Resolution / button`;
    case 'concept-deepener':
      return `Core theme: Identity and sacrifice.\n\nExpanded concept: ${snippet}…\n\nDeeper layers: moral ambiguity, cost of success.`;
    case 'originality-checker':
      return `Originality score: 78%. Distinct elements: premise, setting. Consider differentiating the third-act twist further.`;
    case 'pitch-builder':
      return `HOOK: ${snippet}…\n\nLOGLINE | STAKES | TONE | COMPARABLES | WHY NOW | CREATIVE TEAM`;
    default:
      return `Enhanced output for: ${snippet}…`;
  }
}

const MOCK_DELAY_MS = 1000;

export const aiWriterService = {
  runTool(toolId, inputText) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const analysis = pick(MOCK_ANALYSES);
          const output = generateMockOutput(toolId, inputText);
          const variantTexts = MOCK_VARIANTS_BY_TOOL[toolId] || MOCK_VARIANTS_BY_TOOL['logline-builder'];
          const variants = variantTexts.map((text, i) => ({ id: `v${i + 1}`, text }));
          resolve({ success: true, data: { analysis, output, variants }, error: null });
        } catch (err) {
          resolve({ success: false, data: null, error: err.message || 'Server Error' });
        }
      }, MOCK_DELAY_MS);
    });
  },

  getHistory(userId) {
    return simulateApi(() => {
      const key = `${HISTORY_KEY}_${userId || 'guest'}`;
      const list = getData(key, []);
      return list.sort((a, b) => b.timestamp - a.timestamp);
    });
  },

  saveRun(userId, toolId, toolName) {
    if (!userId) return;
    const key = `${HISTORY_KEY}_${userId}`;
    const entry = {
      id: `run_${Date.now()}`,
      toolId,
      toolName,
      timestamp: Date.now(),
    };
    updateData(key, (arr) => [entry, ...(arr || [])], []);
  },
};
