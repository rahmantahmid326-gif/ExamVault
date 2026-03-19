import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, AlertCircle, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { loginWithGoogle } from '../services/auth';

export default function LoginPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-bg-page relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white p-10 sm:p-12 rounded-[2.5rem] border-subtle shadow-2xl text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-10">
            <BookOpen size={40} />
          </div>
          
          <h1 className="text-4xl font-serif text-primary-dark mb-4">Welcome Back</h1>
          <p className="text-gray-500 mb-12 leading-relaxed">
            Login with your university email to contribute to the community.
          </p>

          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4 text-left p-4 bg-gray-50 rounded-2xl border-subtle">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-dark uppercase tracking-tight">Student Access</p>
                <p className="text-[10px] text-gray-400">Use @ugrad.iiuc.ac.bd</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left p-4 bg-gray-50 rounded-2xl border-subtle">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-dark uppercase tracking-tight">Verified Content</p>
                <p className="text-[10px] text-gray-400">Moderated by admins</p>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium flex items-center gap-3 text-left"
            >
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
                <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <p className="mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            International Islamic University Chittagong
          </p>
        </div>
      </motion.div>
    </div>
  );
}
