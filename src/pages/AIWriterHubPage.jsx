import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AI_WRITER_TOOLS, EFFORT_TIERS } from '../data/aiWriterData';

function EffortBadge({ tier }) {
  const config = EFFORT_TIERS[tier] || EFFORT_TIERS.medium;
  const colors =
    tier === 'low'
      ? 'bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
      : tier === 'high'
        ? 'bg-amber-900/50 border-amber-500/40 text-amber-300'
        : 'bg-sky-900/50 border-sky-500/40 text-sky-300';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors}`}>
      {config.label}
    </span>
  );
}

export default function AIWriterHubPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-sm text-center max-w-xl mx-auto">
        Writers retain full authorship. AI assists only with refinement and structure. Every output
        remains original and safe.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {AI_WRITER_TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-navy-600/50 bg-navy-900/30 p-4 hover:border-gold/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-serif font-bold text-white">{tool.name}</h3>
              <EffortBadge tier={tool.effortTier} />
            </div>
            <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
            <button
              type="button"
              onClick={() => navigate(`/ai-writer/tool/${tool.id}`)}
              className="w-full py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/25 transition-colors"
            >
              Use tool
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
