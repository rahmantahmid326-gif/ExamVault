import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Upload, 
  Shield, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  ChevronRight,
  FileText,
  Download,
  Filter,
  ArrowLeft,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { loginWithGoogle, logout } from './services/auth';
import { getUserProfile, createUserProfile } from './services/firestore';
import { UserProfile } from './types';

// Pages
import Home from './pages/Home';
import DepartmentPage from './pages/Department';
import CoursePage from './pages/Course';
import UploadPage from './pages/Upload';
import AdminPage from './pages/Admin';
import LoginPage from './pages/Login';

// Utils
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
const Navbar = ({ user, profile }: { user: User | null, profile: UserProfile | null }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Browse', path: '/', icon: LayoutGrid },
    { name: 'Contact', path: '#', icon: UserIcon },
  ];

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator' || user?.email === 'rahmantahmid326@gmail.com';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-1 group">
              <span className="text-xl font-serif font-normal tracking-tight text-primary-dark">
                Exam<span className="text-primary">Vault</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-normal transition-colors hover:bg-bg-page hover:text-[#1a1a1a]",
                  location.pathname === link.path ? "text-[#1a1a1a] font-medium" : "text-[#666]"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-normal transition-colors hover:bg-bg-page hover:text-[#1a1a1a]",
                  location.pathname === '/admin' ? "text-[#1a1a1a] font-medium" : "text-[#666]"
                )}
              >
                Admin
              </Link>
            )}

            <div className="w-[0.5px] h-[18px] bg-border-subtle mx-2" />

            <Link
              to="/upload"
              className="bg-primary text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-primary-dark transition-colors ml-1"
            >
              + Upload
            </Link>

            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border-subtle">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-semibold text-gray-900">{user.displayName}</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">{profile?.role || 'student'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-primary-dark border-[0.5px] border-primary px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-primary-light transition-colors ml-2"
              >
                Log in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border-subtle overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    location.pathname === link.path ? "bg-primary-light text-primary" : "text-[#666] hover:bg-bg-page"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    location.pathname === '/admin' ? "bg-primary-light text-primary" : "text-[#666] hover:bg-bg-page"
                  )}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/upload"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary text-white"
              >
                + Upload
              </Link>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border-[0.5px] border-primary text-primary-dark"
                >
                  Log in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let userProfile = await getUserProfile(currentUser.uid);
        if (!userProfile) {
          await createUserProfile(currentUser.uid, currentUser.email || '');
          userProfile = await getUserProfile(currentUser.uid);
        }
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} profile={profile} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={user} profile={profile} />} />
            <Route path="/department/:deptId" element={<DepartmentPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/upload" element={<UploadPage user={user} />} />
            <Route path="/admin" element={<AdminPage user={user} profile={profile} />} />
            <Route path="/login" element={<LoginPage user={user} />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-border-subtle py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-[#888]">
            <span>ExamVault — open question bank · IIUC</span>
            <span>6 faculties · 16 departments · free to use</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
