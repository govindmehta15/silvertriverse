import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-navy-800 border-2 border-gold/30 flex items-center justify-center mb-6 shadow-glow-gold">
                    <span className="text-3xl">🔒</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-gold mb-2">Access Denied</h2>
                <p className="text-gray-400 mb-8 max-w-sm">
                    You must be logged in to access secure endpoints.
                </p>
            </div>
        );
    }

    return children;
}
