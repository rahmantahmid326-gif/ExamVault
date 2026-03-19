import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ChevronRight, BookOpen, Users, GraduationCap, Shield, Upload } from 'lucide-react';
import { FACULTIES, DEPARTMENTS } from '../constants';
import { cn } from '../App';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

export default function Home({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFaculty, setSelectedFaculty] = React.useState<string | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator' || user?.email === 'rahmantahmid326@gmail.com';

  const filteredDepartments = DEPARTMENTS.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty = selectedFaculty ? dept.facultyId === selectedFaculty : true;
    return matchesSearch && matchesFaculty;
  });

  const facultyGroups = FACULTIES.filter(f => !selectedFaculty || f.id === selectedFaculty).map(faculty => ({
    ...faculty,
    departments: filteredDepartments.filter(d => d.facultyId === faculty.id)
  })).filter(group => group.departments.length > 0);

  const icons = [
    <BookOpen size={16} />,
    <Users size={16} />,
    <GraduationCap size={16} />,
    <Shield size={16} />
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-border-subtle pt-12 pb-0 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-[11px] font-medium uppercase tracking-[0.07em] bg-primary-light text-primary-dark px-3.5 py-1 rounded-full mb-5">
              Free · Open · No sign-up to browse
            </span>
            <h1 className="text-4xl md:text-[38px] text-[#1a1a1a] font-serif leading-[1.2] max-w-[520px] mx-auto mb-4">
              Every past exam question, <span className="italic text-primary">organised</span>
            </h1>
            <p className="text-sm text-[#666] max-w-[420px] mx-auto mb-7 leading-[1.7]">
              Browse and download question papers, syllabuses, and resources from all 6 faculties and 16 departments.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                Browse questions
              </button>
              <Link
                to="/upload"
                className="bg-white text-primary-dark border-[0.5px] border-primary px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors flex items-center gap-1.5"
              >
                <Upload size={15} />
                Upload a paper
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Shield size={15} />
                  Admin Panel
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats Strip */}
          <div className="flex justify-center border-t border-border-subtle overflow-x-auto no-scrollbar">
            {[
              { label: 'Faculties', value: '6' },
              { label: 'Departments', value: '16' },
              { label: 'Semesters', value: '8' },
            ].map((stat, i) => (
              <div key={i} className="flex-1 min-w-[100px] px-4 sm:px-8 py-4 text-center border-r border-border-subtle last:border-r-0">
                <div className="font-serif text-[18px] sm:text-[22px] text-primary-dark leading-none">{stat.value}</div>
                <div className="text-[10px] sm:text-[11px] text-[#888] uppercase tracking-[0.05em] mt-1 whitespace-nowrap">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="bg-white border-b border-border-subtle sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col gap-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search department or course..."
              className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg pl-3 pr-10 py-2 text-[13px] focus:outline-none focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]" />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] text-[#888] uppercase tracking-[0.06em] whitespace-nowrap mr-1">Faculty:</span>
            
            <button
              onClick={() => setSelectedFaculty(null)}
              className={cn(
                "px-3 py-1 rounded-full text-[12px] transition-all border-[0.5px] whitespace-nowrap",
                !selectedFaculty ? "bg-primary-light text-primary-dark border-primary font-medium" : "bg-bg-page text-[#888] border-[#ccc] hover:border-primary hover:text-primary-dark"
              )}
            >
              All
            </button>
            
            {FACULTIES.map(faculty => (
              <button
                key={faculty.id}
                onClick={() => setSelectedFaculty(faculty.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-[12px] transition-all border-[0.5px] whitespace-nowrap",
                  selectedFaculty === faculty.id ? "bg-primary-light text-primary-dark border-primary font-medium" : "bg-bg-page text-[#888] border-[#ccc] hover:border-primary hover:text-primary-dark"
                )}
              >
                {faculty.name.replace('Faculty of ', '').replace('Science and Engineering', 'Science & Eng.')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {facultyGroups.map((group) => (
          <div key={group.id} className="mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-[11px] font-medium text-primary-dark uppercase tracking-[0.07em] whitespace-nowrap">
                {group.name}
              </span>
              <div className="flex-1 h-[0.5px] bg-border-subtle" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {group.departments.map((dept, i) => (
                <Link
                  key={dept.id}
                  to={`/department/${dept.id}`}
                  className="bg-white border-[0.5px] border-border-subtle rounded-xl p-4.5 hover:border-primary transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary-dark">
                      {icons[i % icons.length]}
                    </div>
                    <ChevronRight size={16} className="text-[#888] group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h3 className="text-[13px] font-medium leading-[1.4] text-[#1a1a1a] mb-2.5">
                    {dept.name}
                  </h3>
                  
                  <div className="flex gap-3">
                    <div>
                      <div className="text-[15px] font-medium text-primary leading-none">24</div>
                      <div className="text-[10px] text-[#888] uppercase tracking-[0.04em] mt-0.5">Papers</div>
                    </div>
                    <div>
                      <div className="text-[15px] font-medium text-primary leading-none">8</div>
                      <div className="text-[10px] text-[#888] uppercase tracking-[0.04em] mt-0.5">Courses</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {facultyGroups.length === 0 && (
          <div className="text-center py-20 text-[#888] text-sm">
            No departments found.
          </div>
        )}
      </div>
    </div>
  );
}
