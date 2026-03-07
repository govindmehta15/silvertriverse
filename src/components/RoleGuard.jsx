import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * RoleGuard Component
 * Resolves children if user has one of the `allowedRoles`.
 * If `fallbackRoute` is provided, redirects them (useful for full page protection).
 * Otherwise renders nothing (useful for conditional UI elements like buttons).
 */
export default function RoleGuard({ children, allowedRoles, fallbackRoute }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return fallbackRoute ? <Navigate to={fallbackRoute} replace /> : null;
    }

    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
        return fallbackRoute ? <Navigate to={fallbackRoute} replace /> : null;
    }

    return <>{children}</>;
}
