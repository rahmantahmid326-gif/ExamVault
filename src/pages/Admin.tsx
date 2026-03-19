import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Book, 
  Layers, 
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User as UserIcon,
  BarChart3,
  Inbox,
  Building2,
  Plus,
  FileUp,
  History,
  Users,
  Eye,
  Search,
  MoreVertical,
  Trash2,
  BookOpen,
  X,
  Menu
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, addDoc, Timestamp, getDocs, limit, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { updateContentStatus } from '../services/firestore';
import { UserProfile, QuestionPaper, Syllabus, Resource, Course } from '../types';
import { cn } from '../App';
import { format, formatDistanceToNow } from 'date-fns';
import { DEPARTMENTS, FACULTIES } from '../constants';
import { User } from 'firebase/auth';

type AdminSection = 'dashboard' | 'submissions' | 'courses' | 'departments' | 'users';

export default function AdminPage({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState<AdminSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  // Stats
  const [stats, setStats] = React.useState({
    pending: 0,
    papers: 0,
    courses: 0,
    students: 0
  });

  // Submissions
  const [pendingPapers, setPendingPapers] = React.useState<QuestionPaper[]>([]);
  const [pendingSyllabuses, setPendingSyllabuses] = React.useState<Syllabus[]>([]);
  const [pendingResources, setPendingResources] = React.useState<Resource[]>([]);
  const [activeSubTab, setActiveSubTab] = React.useState<'papers' | 'syllabuses' | 'resources'>('papers');
  const [previewItem, setPreviewItem] = React.useState<any | null>(null);

  // Courses
  const [allCourses, setAllCourses] = React.useState<Course[]>([]);
  const [newCourse, setNewCourse] = React.useState({
    code: '',
    name: '',
    creditHours: 3,
    semester: 1,
    departmentId: '',
    prerequisites: ''
  });
  const [isAddingCourse, setIsAddingCourse] = React.useState(false);

  // Users
  const [allUsers, setAllUsers] = React.useState<UserProfile[]>([]);
  const [isUpdatingRole, setIsUpdatingRole] = React.useState<string | null>(null);

  // Activity
  const [activities, setActivities] = React.useState<any[]>([]);

  const isBootstrapAdmin = user?.email === 'rahmantahmid326@gmail.com';
  const isAdmin = profile?.role === 'admin' || isBootstrapAdmin;
  const isModerator = profile?.role === 'moderator' || isAdmin;

  React.useEffect(() => {
    if (!user || (!isModerator)) {
      navigate('/');
      return;
    }

    // Real-time listeners for pending items
    const qPapers = query(collection(db, 'question_papers'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const qSyllabuses = query(collection(db, 'syllabuses'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const qResources = query(collection(db, 'resources'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));

    const unsubPapers = onSnapshot(qPapers, (s) => {
      const papers = s.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setPendingPapers(papers);
    });
    const unsubSyllabuses = onSnapshot(qSyllabuses, (s) => {
      const syllabuses = s.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setPendingSyllabuses(syllabuses);
    });
    const unsubResources = onSnapshot(qResources, (s) => {
      const resources = s.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setPendingResources(resources);
    });

    // Fetch stats and users
    const fetchData = async () => {
      const papersSnap = await getDocs(query(collection(db, 'question_papers'), where('status', '==', 'approved')));
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const allUsersSnap = await getDocs(collection(db, 'users'));
      
      setStats({
        pending: pendingPapers.length + pendingSyllabuses.length + pendingResources.length,
        papers: papersSnap.size,
        courses: coursesSnap.size,
        students: studentsSnap.size
      });

      setAllCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      setAllUsers(allUsersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    };

    fetchData();
    setLoading(false);

    return () => {
      unsubPapers();
      unsubSyllabuses();
      unsubResources();
    };
  }, [user, profile, navigate, pendingPapers.length, pendingSyllabuses.length, pendingResources.length]);

  // Update stats whenever pending counts change
  React.useEffect(() => {
    setStats(prev => ({
      ...prev,
      pending: pendingPapers.length + pendingSyllabuses.length + pendingResources.length
    }));
  }, [pendingPapers, pendingSyllabuses, pendingResources]);

  const handleAction = async (collectionName: string, id: string, status: 'approved' | 'rejected') => {
    try {
      await updateContentStatus(collectionName, id, status);
      // Log activity
      await addDoc(collection(db, 'activity_log'), {
        type: status,
        itemType: collectionName,
        itemId: id,
        adminId: user?.uid,
        adminEmail: user?.email,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  const handleUpdateRole = async (targetUid: string, newRole: 'student' | 'moderator' | 'admin') => {
    if (!isAdmin || targetUid === user?.uid) return;
    setIsUpdatingRole(targetUid);
    try {
      await updateDoc(doc(db, 'users', targetUid), { role: newRole });
      // Refresh users
      const allUsersSnap = await getDocs(collection(db, 'users'));
      setAllUsers(allUsersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      alert('User role updated successfully!');
    } catch (err) {
      console.error('Update role error:', err);
      alert('Failed to update role.');
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsAddingCourse(true);
    try {
      await addDoc(collection(db, 'courses'), newCourse);
      setNewCourse({
        code: '',
        name: '',
        creditHours: 3,
        semester: 1,
        departmentId: '',
        prerequisites: ''
      });
      // Refresh courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      setAllCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      alert('Course added successfully!');
    } catch (err) {
      console.error('Add course error:', err);
    } finally {
      setIsAddingCourse(false);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const coursesToImport = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const course: any = {};
        headers.forEach((header, i) => {
          if (header === 'credit_hours' || header === 'semester') {
            course[header === 'credit_hours' ? 'creditHours' : 'semester'] = Number(values[i]);
          } else if (header === 'course_code') {
            course.code = values[i];
          } else if (header === 'course_name') {
            course.name = values[i];
          } else {
            course[header] = values[i];
          }
        });
        return course;
      });

      try {
        for (const course of coursesToImport) {
          await addDoc(collection(db, 'courses'), course);
        }
        alert(`Successfully imported ${coursesToImport.length} courses!`);
        // Refresh courses
        const coursesSnap = await getDocs(collection(db, 'courses'));
        setAllCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      } catch (err) {
        console.error('CSV Import error:', err);
        alert('Failed to import courses. Check console for details.');
      }
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const headers = 'departmentId,course_code,course_name,credit_hours,semester,prerequisites';
    const sample = 'cse,CSE601,Machine Learning,3,6,CSE201\neee,EEE101,Circuit Theory,3,1,None';
    const blob = new Blob([`${headers}\n${sample}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'examvault_course_template.csv';
    a.click();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-border-subtle sticky top-16 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white">
            <Shield size={16} />
          </div>
          <span className="font-serif text-sm text-primary-dark">Admin Panel</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 text-[#666] hover:bg-bg-page rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-border-subtle transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-64px)] overflow-y-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Shield size={18} />
              </div>
              <span className="font-serif text-lg text-primary-dark">Admin Panel</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-[#666] hover:bg-bg-page rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'submissions', name: 'Submissions', icon: Inbox, count: stats.pending },
              { id: 'courses', name: 'Courses', icon: BookOpen },
              { id: 'departments', name: 'Departments', icon: Building2 },
              { id: 'users', name: 'Users', icon: Users },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as AdminSection);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] transition-all",
                  activeSection === item.id 
                    ? "bg-primary-light text-primary-dark font-medium" 
                    : "text-[#666] hover:bg-bg-page hover:text-[#1a1a1a]"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.name}
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    item.id === 'submissions' ? "bg-amber-100 text-amber-700" : "bg-primary text-white"
                  )}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-dark text-xs font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-[#1a1a1a] truncate">{user.email}</div>
              <div className="text-[10px] text-[#888] uppercase tracking-wider">{profile?.role || 'Admin'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeSection === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-serif text-primary-dark mb-1">Welcome back, {user.displayName?.split(' ')[0] || 'Admin'}</h1>
                  <p className="text-sm text-[#666]">Here's what's happening on ExamVault today.</p>
                </div>
                <div className="text-[12px] text-[#888] bg-white px-4 py-2 rounded-lg border border-border-subtle w-fit">
                  {format(new Date(), 'EEEE, MMMM do yyyy')}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Pending Submissions', value: stats.pending, icon: Inbox, color: 'amber' },
                  { label: 'Published Papers', value: stats.papers, icon: FileText, color: 'primary' },
                  { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'blue' },
                  { label: 'Registered Students', value: stats.students, icon: Users, color: 'purple' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                        stat.color === 'primary' ? "bg-primary-light text-primary" :
                        stat.color === 'blue' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      )}>
                        <stat.icon size={20} />
                      </div>
                      <div className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12%</div>
                    </div>
                    <div className="text-2xl font-serif text-[#1a1a1a] mb-1">{stat.value}</div>
                    <div className="text-[11px] text-[#888] uppercase tracking-wider font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
                  <h2 className="text-[15px] font-medium text-[#1a1a1a] flex items-center gap-2">
                    <History size={18} className="text-[#888]" />
                    Recent Activity
                  </h2>
                  <button className="text-[12px] text-primary font-medium hover:underline">View all</button>
                </div>
                <div className="divide-y divide-border-subtle">
                  {pendingPapers.length > 0 ? pendingPapers.slice(0, 5).map((paper, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-bg-page transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Plus size={16} />
                        </div>
                        <div>
                          <div className="text-[13px] text-[#1a1a1a]">
                            New <span className="font-medium">Question Paper</span> submitted for <span className="font-medium">{paper.courseId}</span>
                          </div>
                          <div className="text-[11px] text-[#888] mt-0.5">By Student {paper.submittedBy.substring(0, 6)}</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#888]">
                        {paper.createdAt instanceof Timestamp ? formatDistanceToNow(paper.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                      </div>
                    </div>
                  )) : (
                    <div className="px-6 py-12 text-center text-[#888] text-sm italic">
                      No recent activity to show.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'submissions' && (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-serif text-primary-dark mb-1">Submissions Queue</h1>
                  <p className="text-sm text-[#666]">Review and publish student contributions.</p>
                </div>
                <div className="flex flex-wrap gap-1.5 bg-white border border-border-subtle rounded-xl p-1.5 w-fit">
                  {[
                    { id: 'papers', name: 'Papers', count: pendingPapers.length },
                    { id: 'syllabuses', name: 'Syllabuses', count: pendingSyllabuses.length },
                    { id: 'resources', name: 'Resources', count: pendingResources.length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[12px] transition-all",
                        activeSubTab === tab.id ? "bg-primary text-white font-medium shadow-sm" : "text-[#888] hover:text-[#1a1a1a]"
                      )}
                    >
                      {tab.name} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-page border-b border-border-subtle">
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider w-12">Type</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Name / Course</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Uploader</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {(activeSubTab === 'papers' ? pendingPapers : activeSubTab === 'syllabuses' ? pendingSyllabuses : pendingResources).map((item: any) => (
                      <tr key={item.id} className="hover:bg-bg-page transition-colors group">
                        <td className="px-6 py-4">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            activeSubTab === 'papers' ? "bg-blue-500" : activeSubTab === 'syllabuses' ? "bg-green-500" : "bg-purple-500"
                          )} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[13px] font-medium text-[#1a1a1a]">
                            {activeSubTab === 'resources' ? item.title : `${item.examType || 'Syllabus'} ${item.year || ''}`}
                          </div>
                          <div className="text-[11px] text-[#888] mt-0.5">{item.courseId}</div>
                        </td>
                        <td className="px-6 py-4 text-[12px] text-[#666]">
                          {item.submittedBy.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-[12px] text-[#888]">
                          {item.createdAt instanceof Timestamp ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setPreviewItem(item)}
                              className="p-2 text-[#888] hover:text-primary transition-colors"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(activeSubTab === 'papers' ? 'question_papers' : activeSubTab === 'syllabuses' ? 'syllabuses' : 'resources', item.id, 'rejected')}
                              className="p-2 text-[#888] hover:text-red-500 transition-colors"
                              title="Decline"
                            >
                              <XCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(activeSubTab === 'papers' ? 'question_papers' : activeSubTab === 'syllabuses' ? 'syllabuses' : 'resources', item.id, 'approved')}
                              className="p-2 text-[#888] hover:text-green-500 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(activeSubTab === 'papers' ? pendingPapers : activeSubTab === 'syllabuses' ? pendingSyllabuses : pendingResources).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#888] text-sm italic">
                          Queue is empty for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeSection === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-serif text-primary-dark mb-1">Course Management</h1>
                    <p className="text-sm text-[#666]">Add and manage courses for all departments.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={downloadCSVTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-border-subtle rounded-xl text-[12px] font-medium text-[#666] hover:bg-bg-page transition-all"
                    >
                      <Download size={16} />
                      Template
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-border-subtle rounded-xl text-[12px] font-medium text-[#666] hover:bg-bg-page transition-all cursor-pointer">
                      <FileUp size={16} />
                      Bulk Import
                      <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
                    <h2 className="text-[15px] font-medium text-[#1a1a1a]">Recently Added</h2>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                      <input 
                        type="text" 
                        placeholder="Filter courses..."
                        className="bg-bg-page border border-border-subtle rounded-lg pl-9 pr-3 py-1.5 text-[12px] focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-page border-b border-border-subtle">
                        <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Dept</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Sem</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {allCourses.slice(0, 10).map((course) => (
                        <tr key={course.id} className="hover:bg-bg-page transition-colors">
                          <td className="px-6 py-4 text-[13px] font-mono text-primary">{course.code}</td>
                          <td className="px-6 py-4 text-[13px] text-[#1a1a1a]">{course.name}</td>
                          <td className="px-6 py-4 text-[11px] text-[#888] uppercase">{course.departmentId}</td>
                          <td className="px-6 py-4 text-[12px] text-[#666]">{course.semester}th</td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 text-[#888] hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm">
                  <h2 className="text-[16px] font-serif text-primary-dark mb-6 flex items-center gap-2">
                    <Plus size={18} />
                    Add Single Course
                  </h2>
                  <form onSubmit={handleAddCourse} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1.5">Department</label>
                      <select 
                        required
                        className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary"
                        value={newCourse.departmentId}
                        onChange={(e) => setNewCourse({...newCourse, departmentId: e.target.value})}
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1.5">Course Code</label>
                        <input 
                          required
                          type="text"
                          placeholder="CSE601"
                          className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary"
                          value={newCourse.code}
                          onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1.5">Credit Hours</label>
                        <select 
                          className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary"
                          value={newCourse.creditHours}
                          onChange={(e) => setNewCourse({...newCourse, creditHours: Number(e.target.value)})}
                        >
                          {[1, 1.5, 2, 3, 4].map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1.5">Course Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="Machine Learning"
                        className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1.5">Semester</label>
                      <select 
                        className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary"
                        value={newCourse.semester}
                        onChange={(e) => setNewCourse({...newCourse, semester: Number(e.target.value)})}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}{s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th'} Semester</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1.5">Prerequisites</label>
                      <input 
                        type="text"
                        placeholder="e.g. CSE201 or None"
                        className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary"
                        value={newCourse.prerequisites}
                        onChange={(e) => setNewCourse({...newCourse, prerequisites: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isAddingCourse}
                      className="w-full bg-primary text-white py-3 rounded-xl text-[13px] font-medium hover:bg-primary-dark transition-all disabled:opacity-50 mt-2"
                    >
                      {isAddingCourse ? 'Adding...' : 'Add Course'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'departments' && (
            <motion.div
              key="departments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl font-serif text-primary-dark mb-1">Departments Overview</h1>
                <p className="text-sm text-[#666]">Structure of faculties and departments at IIUC.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {FACULTIES.map(faculty => (
                  <div key={faculty.id} className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-primary-light border-b border-border-subtle">
                      <h2 className="text-[14px] font-bold text-primary-dark uppercase tracking-wider">{faculty.name}</h2>
                    </div>
                    <div className="p-4">
                      <div className="space-y-1">
                        {DEPARTMENTS.filter(d => d.facultyId === faculty.id).map(dept => (
                          <div key={dept.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-bg-page transition-colors">
                            <span className="text-[13px] text-[#1a1a1a]">{dept.name}</span>
                            <span className="text-[10px] font-mono text-[#888] uppercase">{dept.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-serif text-primary-dark mb-1">User Management</h1>
                  <p className="text-sm text-[#666]">Manage user roles and permissions.</p>
                </div>
                {!isAdmin && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700">
                    <AlertCircle size={16} />
                    Only Admins can change roles
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-page border-b border-border-subtle">
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">UID</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {allUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-bg-page transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary-dark text-xs font-bold">
                              {u.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-[13px] font-medium text-[#1a1a1a]">{u.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            u.role === 'admin' ? "bg-red-50 text-red-600" :
                            u.role === 'moderator' ? "bg-amber-50 text-amber-600" :
                            "bg-blue-50 text-blue-600"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-mono text-[#888]">
                          {u.uid}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isAdmin && u.uid !== user?.uid ? (
                            <div className="flex justify-end gap-2">
                              <select 
                                disabled={isUpdatingRole === u.uid}
                                className="bg-white border border-border-subtle rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-primary disabled:opacity-50"
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u.uid, e.target.value as any)}
                              >
                                <option value="student">Student</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#888] italic">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-[16px] font-serif text-primary-dark">
                    {previewItem.title || `${previewItem.examType} ${previewItem.year}`}
                  </h3>
                  <p className="text-[11px] text-[#888]">{previewItem.courseId} · {previewItem.submittedBy}</p>
                </div>
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded-full bg-bg-page flex items-center justify-center text-[#888] hover:text-[#1a1a1a] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 bg-bg-page overflow-auto p-4">
                {previewItem.fileUrl.endsWith('.pdf') ? (
                  <iframe 
                    src={previewItem.fileUrl} 
                    className="w-full h-full rounded-xl border border-border-subtle"
                    title="PDF Preview"
                  />
                ) : (
                  <img 
                    src={previewItem.fileUrl} 
                    alt="Preview" 
                    className="max-w-full h-auto mx-auto rounded-xl shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="px-6 py-4 border-t border-border-subtle bg-white flex justify-end gap-3">
                <button 
                  onClick={() => {
                    handleAction(activeSubTab === 'papers' ? 'question_papers' : activeSubTab === 'syllabuses' ? 'syllabuses' : 'resources', previewItem.id, 'rejected');
                    setPreviewItem(null);
                  }}
                  className="px-6 py-2 rounded-xl text-[13px] font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Decline
                </button>
                <button 
                  onClick={() => {
                    handleAction(activeSubTab === 'papers' ? 'question_papers' : activeSubTab === 'syllabuses' ? 'syllabuses' : 'resources', previewItem.id, 'approved');
                    setPreviewItem(null);
                  }}
                  className="px-6 py-2 rounded-xl text-[13px] font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
