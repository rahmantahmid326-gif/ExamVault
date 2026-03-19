import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  GraduationCap, 
  BookOpen, 
  FileText,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DEPARTMENTS, FACULTIES, SEMESTERS } from '../constants';
import { getCourses } from '../services/firestore';
import { Course } from '../types';
import { cn } from '../App';

export default function DepartmentPage() {
  const { deptId } = useParams();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSemester, setSelectedSemester] = React.useState<number | null>(null);

  const department = DEPARTMENTS.find(d => d.id === deptId);
  const faculty = FACULTIES.find(f => f.id === department?.facultyId);

  React.useEffect(() => {
    if (deptId) {
      getCourses(deptId).then(data => {
        setCourses(data || []);
        setLoading(false);
      });
    }
  }, [deptId]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = selectedSemester ? course.semester === selectedSemester : true;
    return matchesSearch && matchesSemester;
  });

  if (!department) return <div>Department not found</div>;

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-white border-b border-black/5 pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark mb-8 group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Faculties
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">
                {faculty?.name}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-primary-dark mb-6">
                {department.name}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-primary" />
                  {courses.length} Courses
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  8 Semesters
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  450+ Resources
                </div>
              </div>
            </div>

            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search course code or name..."
                className="w-full bg-gray-50 h-12 pl-12 pr-4 rounded-xl text-sm border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Semester Filter */}
        <div className="bg-white p-2 rounded-2xl shadow-md border-subtle mb-10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 border-r border-black/5 mr-2">
            Semesters
          </div>
          <button
            onClick={() => setSelectedSemester(null)}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              !selectedSemester ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            All
          </button>
          {SEMESTERS.map(sem => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedSemester === sem ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white h-48 rounded-3xl animate-pulse border-subtle" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={`/course/${course.id}`}
                  className="group block bg-white p-8 rounded-3xl border-subtle hover:border-primary transition-all hover:shadow-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-3 py-1 bg-primary-light text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {course.code}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {course.semester}{course.semester === 1 ? 'st' : course.semester === 2 ? 'nd' : course.semester === 3 ? 'rd' : 'th'} Semester
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif text-primary-dark mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                    {course.name}
                  </h3>
                  
                  <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Credits</span>
                        <span className="text-sm font-bold text-gray-700">{course.creditHours}</span>
                      </div>
                      <div className="w-px h-6 bg-black/5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Papers</span>
                        <span className="text-sm font-bold text-gray-700">12</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Filter size={32} />
            </div>
            <h3 className="text-xl font-serif text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or semester filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
