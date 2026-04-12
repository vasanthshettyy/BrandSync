import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 p-4">
      <div className="glass-card max-w-md w-full text-center p-8 border border-white/10 shadow-2xl">
        <h1 className="text-7xl font-black text-primary mb-2">404</h1>
        <div className="h-1 w-12 bg-gradient-brand mx-auto mb-6 rounded-full" />
        <p className="text-xl font-medium text-text-primary mb-2">Page Not Found</p>
        <p className="text-text-secondary mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/login" 
          className="btn-primary w-full py-3"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}
