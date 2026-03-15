import { useParams, useNavigate } from 'react-router-dom';
import { getToolById } from '../data/aiWriterData';
import { useAuth } from '../context/AuthContext';
import { aiWriterService } from '../services/aiWriterService';
import AIWriterWorkflow from '../features/ai-writer/AIWriterWorkflow';

export default function AIWriterWorkflowPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const tool = getToolById(toolId);

  if (!tool) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">Tool not found.</p>
        <button
          type="button"
          onClick={() => navigate('/ai-writer')}
          className="text-gold hover:underline"
        >
          Back to hub
        </button>
      </div>
    );
  }

  const handleSaveRun = (id, name) => {
    if (user?.id) aiWriterService.saveRun(user.id, id, name);
  };

  return <AIWriterWorkflow tool={tool} onSaveRun={handleSaveRun} />;
}
