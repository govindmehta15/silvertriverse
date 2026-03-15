export const CREDIT_TIERS = {
    low: { label: 'Basic', credits: 50 },
    medium: { label: 'Standard', credits: 150 },
    high: { label: 'Premium', credits: 500 },
};

export const AI_PRODUCER_TOOLS = [
    {
        id: 'logline-check',
        name: 'Logline Check',
        description: 'Quick evaluation of your story\'s hook and basic premise.',
        creditTier: 'low',
        credits: CREDIT_TIERS.low.credits,
    },
    {
        id: 'story-structure',
        name: 'Story Structure Analysis',
        description: 'In-depth look at pacing, beats, and narrative architecture.',
        creditTier: 'medium',
        credits: CREDIT_TIERS.medium.credits,
    },
    {
        id: 'full-script',
        name: 'Full Script Analysis',
        description: 'Comprehensive report on characters, dialogue, and commercial potential.',
        creditTier: 'high',
        credits: CREDIT_TIERS.high.credits,
    },
    {
        id: 'legal-risk',
        name: 'Legal Risk Scan',
        description: 'Identifies potential copyright issues or story similarities.',
        creditTier: 'high',
        credits: CREDIT_TIERS.high.credits,
    },
    {
        id: 'viability-eval',
        name: 'Market Viability',
        description: 'Data-driven assessment of budget feasibility and audience appeal.',
        creditTier: 'medium',
        credits: CREDIT_TIERS.medium.credits,
    },
    {
        id: 'sensitivity-check',
        name: 'Sensitivity Analysis',
        description: 'Flags cultural or political red-flags and sensitivities.',
        creditTier: 'medium',
        credits: CREDIT_TIERS.medium.credits,
    }
];
