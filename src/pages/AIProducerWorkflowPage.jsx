import { useParams, useNavigate } from 'react-router-dom';
import { useCredits } from '../context/CreditsContext';
import { AI_PRODUCER_TOOLS } from '../data/aiProducerData';
import AIProducerWorkflow from '../features/ai-producer/AIProducerWorkflow';

export default function AIProducerWorkflowPage() {
    const { toolId } = useParams();
    const navigate = useNavigate();
    const { deductCredits, saveHistory } = useCredits();

    const tool = AI_PRODUCER_TOOLS.find((t) => t.id === toolId);

    if (!tool) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-400">Tool not found.</p>
                <button onClick={() => navigate('/ai-producer')} className="text-gold mt-4">Back to Hub</button>
            </div>
        );
    }

    const handleDeduct = async (amount) => {
        return await deductCredits(amount);
    };

    const handleSaveRun = (toolId, toolName, cost) => {
        saveHistory({
            type: 'ai-producer',
            toolId,
            toolName,
            cost,
            timestamp: new Date().toISOString()
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate('/ai-producer')}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to AI Producer Hub
            </button>

            <AIProducerWorkflow
                tool={tool}
                creditsCost={tool.credits}
                onDeduct={handleDeduct}
                onSaveRun={handleSaveRun}
            />
        </div>
    );
}
