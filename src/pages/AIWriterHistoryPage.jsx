import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { aiWriterService } from '../services/aiWriterService';
import { format } from 'date-fns';

export default function AIWriterHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setHistory([]);
      setLoading(false);
      return;
    }
    aiWriterService.getHistory(user.id).then((res) => {
      if (res.success && Array.isArray(res.data)) setHistory(res.data);
      setLoading(false);
    });
  }, [user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 rounded-xl border border-navy-600/50 bg-navy-900/30 p-6">
        <p className="text-gray-400 mb-2">Login to see your AI Writer history.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading history…</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl border border-navy-600/50 bg-navy-900/30 p-6">
        <p className="text-gray-400">No runs yet.</p>
        <p className="text-gray-500 text-sm mt-1">Use a tool from the hub to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-lg font-bold text-white">Your runs</h2>
      <ul className="space-y-2">
        {history.map((run, i) => (
          <motion.li
            key={run.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between py-3 px-4 rounded-lg bg-navy-800/50 border border-navy-600/50"
          >
            <div>
              <p className="font-medium text-white">{run.toolName}</p>
              <p className="text-gray-500 text-xs">{format(run.timestamp, 'PPp')}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
