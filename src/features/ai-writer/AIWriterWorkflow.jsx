import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiWriterService } from '../../services/aiWriterService';

const STAGE_LABELS = [
  'Tool',
  'Input',
  'Narrative analysis',
  'Structured output',
  'Creative verification',
  'Writer refinement',
  'Export & pitch',
];

export default function AIWriterWorkflow({ tool, onSaveRun }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [refinedText, setRefinedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedVariantText = variants.find((v) => v.id === selectedVariantId)?.text;
  const displayText = refinedText || selectedVariantText || generatedOutput;

  const handleStart = () => setStage(2);

  const handleNextFromInput = async () => {
    if (!inputText.trim()) {
      setError('Please enter some content.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await aiWriterService.runTool(tool.id, inputText);
    setLoading(false);
    if (res.success && res.data) {
      setAnalysisResult(res.data.analysis);
      setGeneratedOutput(res.data.output);
      setVariants(res.data.variants || []);
      setSelectedVariantId(null);
      setRefinedText('');
      onSaveRun(tool.id, tool.name);
      setStage(3);
    } else {
      setError(res.error || 'Analysis failed.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([displayText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-writer-${tool.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToCollectibleUnits = () => {
    navigate('/collectible-units/submit-story', { state: { prefilledSynopsis: displayText } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STAGE_LABELS.map((label, i) => (
          <span
            key={label}
            className={`shrink-0 text-xs px-2 py-1 rounded ${
              i + 1 === stage ? 'bg-gold/20 text-gold' : i + 1 < stage ? 'bg-navy-700 text-gray-400' : 'text-gray-500'
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="rounded-xl border border-navy-600/50 bg-navy-900/30 p-6"
          >
            <h3 className="font-serif text-xl font-bold text-white mb-1">{tool.name}</h3>
            <p className="text-gray-400 text-sm mb-6">{tool.description}</p>
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold font-medium hover:bg-gold/25"
            >
              Start
            </button>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <label className="block text-gray-400 text-sm">Paste or type your content</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Script, logline, concept, or scene..."
              rows={8}
              className="w-full px-4 py-3 rounded-lg bg-navy-800 border border-navy-600 text-white placeholder-gray-500 focus:border-gold/50 resize-y"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="button"
              onClick={handleNextFromInput}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold font-medium hover:bg-gold/25 disabled:opacity-50"
            >
              {loading ? 'Analyzing…' : 'Continue'}
            </button>
          </motion.div>
        )}

        {stage === 3 && analysisResult && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="rounded-xl border border-navy-600/50 bg-navy-900/30 p-6 space-y-4"
          >
            <h4 className="font-medium text-white">Narrative analysis</h4>
            <p className="text-gray-300 text-sm"><strong>Structure:</strong> {analysisResult.structure}</p>
            <p className="text-gray-300 text-sm"><strong>Tone:</strong> {analysisResult.tone}</p>
            <ul className="text-gray-300 text-sm list-disc list-inside">{analysisResult.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <p className="text-gray-400 text-sm"><strong>Suggestions:</strong> {analysisResult.suggestions?.join(' ')}</p>
            <button
              type="button"
              onClick={() => setStage(4)}
              className="px-6 py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold font-medium hover:bg-gold/25"
            >
              Next
            </button>
          </motion.div>
        )}

        {stage === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="rounded-xl border border-navy-600/50 bg-navy-900/30 p-6 space-y-4"
          >
            <h4 className="font-medium text-white">Structured output</h4>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{generatedOutput}</pre>
            <button
              type="button"
              onClick={() => setStage(5)}
              className="px-6 py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold font-medium hover:bg-gold/25"
            >
              Next
            </button>
          </motion.div>
        )}

        {stage === 5 && (
          <motion.div
            key="s5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <h4 className="font-medium text-white">Creative verification – choose a variant or keep current</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="variant"
                  checked={selectedVariantId === null}
                  onChange={() => setSelectedVariantId(null)}
                  className="mt-1"
                />
                <span className="text-gray-300 text-sm">Keep current output</span>
              </label>
              {variants.map((v) => (
                <label key={v.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="variant"
                    checked={selectedVariantId === v.id}
                    onChange={() => setSelectedVariantId(v.id)}
                    className="mt-1"
                  />
                  <span className="text-gray-300 text-sm">{v.text}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStage(6)}
              className="px-6 py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold font-medium hover:bg-gold/25"
            >
              Next
            </button>
          </motion.div>
        )}

        {stage === 6 && (
          <motion.div
            key="s6"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <h4 className="font-medium text-white">Writer refinement – edit your final text</h4>
            <textarea
              value={refinedText || selectedVariantText || generatedOutput}
              onChange={(e) => setRefinedText(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-lg bg-navy-800 border border-navy-600 text-white focus:border-gold/50 resize-y"
            />
            <button
              type="button"
              onClick={() => setStage(7)}
              className="px-6 py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold font-medium hover:bg-gold/25"
            >
              Done
            </button>
          </motion.div>
        )}

        {stage === 7 && (
          <motion.div
            key="s7"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="rounded-xl border border-navy-600/50 bg-navy-900/30 p-6 space-y-4"
          >
            <h4 className="font-medium text-white">Export & pitch</h4>
            <p className="text-gray-400 text-sm">Your refined content is ready. Download or send to Collectible Units.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg bg-gold/15 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/25"
              >
                Download (.txt)
              </button>
              <button
                type="button"
                onClick={handleSendToCollectibleUnits}
                className="px-4 py-2 rounded-lg bg-teal-900/50 border border-teal-500/30 text-teal-300 text-sm font-medium hover:bg-teal-800/50"
              >
                Send to Collectible Units
              </button>
              <button
                type="button"
                onClick={() => navigate('/ai-writer')}
                className="px-4 py-2 rounded-lg bg-navy-700 border border-navy-600 text-gray-300 text-sm font-medium hover:bg-navy-600"
              >
                New tool
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
