import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  User as UserIcon,
  ExternalLink,
  Book,
  Layers,
  Search,
  Filter,
  BookOpen
} from 'lucide-react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getApprovedContent } from '../services/firestore';
import { Course, QuestionPaper, Syllabus, Resource } from '../types';
import { cn } from '../App';
import { format } from 'date-fns';

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [papers, setPapers] = React.useState<QuestionPaper[]>([]);
  const [syllabuses, setSyllabuses] = React.useState<Syllabus[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'papers' | 'syllabus' | 'resources'>('papers');

  React.useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        const docSnap = await getDoc(doc(db, 'courses', courseId));
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
        }
      };

      fetchCourse();

      const unsubPapers = getApprovedContent('question_papers', courseId, setPapers);
      const unsubSyllabuses = getApprovedContent('syllabuses', courseId, setSyllabuses);
      const unsubResources = getApprovedContent('resources', courseId, setResources);

      setLoading(false);

      return () => {
        unsubPapers();
        unsubSyllabuses();
        unsubResources();
      };
    }
  }, [courseId]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!course) return <div className="p-20 text-center">Course not found</div>;

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2.5">
          <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <span>›</span>
            <Link to={`/department/${course.departmentId}`} className="text-primary hover:underline">
              {course.departmentId.toUpperCase()}
            </Link>
            <span>›</span>
            <span className="text-[#1a1a1a]">{course.name}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 text-primary-dark">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-medium text-primary uppercase tracking-[0.06em]">
                  {course.departmentId.toUpperCase()}
                </span>
                <span className="text-[#ccc] text-[12px]">·</span>
                <span className="text-[11px] font-medium bg-[#E6F1FB] text-[#0C447C] px-2 py-0.5 rounded-full">
                  {course.code}
                </span>
              </div>
              <h1 className="text-[28px] font-serif text-[#1a1a1a] leading-[1.2] mb-2">
                {course.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary-light text-primary-dark">
                  {course.semester}{course.semester === 1 ? 'st' : course.semester === 2 ? 'nd' : course.semester === 3 ? 'rd' : 'th'} semester
                </span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F1EFE8] text-[#444441]">
                  {course.creditHours} credit hours
                </span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F1EFE8] text-[#444441]">
                  Pre: {course.prerequisites || 'None'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex border-t border-border-subtle overflow-x-auto no-scrollbar">
            {[
              { label: 'Question papers', value: papers.length },
              { label: 'Syllabus', value: syllabuses.length },
              { label: 'Resources', value: resources.length },
              { label: 'Years covered', value: new Set(papers.map(p => p.year)).size },
            ].map((stat, i) => (
              <div key={i} className="flex-1 min-w-[100px] px-4 py-3 text-center border-r border-border-subtle last:border-r-0">
                <div className="font-serif text-[18px] sm:text-[20px] text-primary-dark leading-none">{stat.value}</div>
                <div className="text-[10px] text-[#888] uppercase tracking-[0.05em] mt-0.5 whitespace-nowrap">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-border-subtle sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3.5">
          <div className="flex gap-1.5 bg-bg-page border-[0.5px] border-border-subtle rounded-xl p-1.5 w-fit">
            {[
              { id: 'papers', name: 'Question papers' },
              { id: 'syllabus', name: 'Syllabus' },
              { id: 'resources', name: 'Resources' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-5.5 py-2 rounded-lg text-[13px] transition-all whitespace-nowrap",
                  activeTab === tab.id ? "bg-white text-primary-dark font-medium border-[0.5px] border-primary shadow-sm" : "text-[#888] hover:text-[#1a1a1a]"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'papers' && (
              <div>
                <div className="flex flex-wrap gap-2 items-center mb-5 p-3.5 bg-white border-[0.5px] border-border-subtle rounded-xl">
                  <span className="text-[11px] text-[#888] uppercase tracking-[0.06em] mr-0.5">Exam</span>
                  <button className="px-3 py-1 rounded-full text-[12px] bg-primary-light text-primary-dark border-[0.5px] border-primary font-medium">All</button>
                  <button className="px-3 py-1 rounded-full text-[12px] bg-bg-page text-[#888] border-[0.5px] border-[#ccc] hover:border-primary">Midterm</button>
                  <button className="px-3 py-1 rounded-full text-[12px] bg-bg-page text-[#888] border-[0.5px] border-[#ccc] hover:border-primary">Final</button>
                </div>

                <div className="text-[12px] text-[#888] mb-4">
                  Showing <strong>{papers.length}</strong> paper{papers.length !== 1 ? 's' : ''}
                </div>

                <div className="space-y-8">
                  {Array.from(new Set(papers.map(p => p.year))).sort((a: number, b: number) => b - a).map(year => (
                    <div key={year}>
                      <div className="flex items-center gap-2.5 mb-3.5">
                        <span className="text-[12px] font-medium text-primary-dark bg-primary-light px-3 py-0.5 rounded-full">
                          {year}
                        </span>
                        <div className="flex-1 h-[0.5px] bg-border-subtle" />
                        <span className="text-[11px] text-[#888]">
                          {papers.filter(p => p.year === year).length} paper{papers.filter(p => p.year === year).length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {papers.filter(p => p.year === year).map(paper => (
                          <div key={paper.id} className="bg-white border-[0.5px] border-border-subtle rounded-xl p-4 flex flex-col gap-2.5 hover:border-primary/40 transition-colors">
                            <div className="flex gap-1.5 flex-wrap">
                              <span className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                paper.examType === 'Midterm' ? "bg-[#FAEEDA] text-[#633806]" : "bg-[#E6F1FB] text-[#0C447C]"
                              )}>
                                {paper.examType}
                              </span>
                              <span className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                paper.season === 'Spring' ? "bg-[#EAF3DE] text-[#27500A]" : "bg-[#EEEDFE] text-[#3C3489]"
                              )}>
                                {paper.season}
                              </span>
                            </div>
                            <div className="text-[13px] font-medium text-[#1a1a1a] leading-[1.4]">
                              {course.name} — {paper.season} {paper.year}
                            </div>
                            <div className="flex justify-between items-center pt-2.5 border-t border-border-subtle">
                              <span className="text-[11px] text-[#888]">
                                <strong className="text-[#1a1a1a] font-medium">8</strong> questions
                              </span>
                              <a
                                href={paper.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-primary text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary-dark transition-colors"
                              >
                                <Download size={12} />
                                Download
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {papers.length === 0 && (
                    <div className="text-center py-10 text-[#888] text-sm">
                      No papers match the selected filters.
                    </div>
                  )}
                </div>

                <div className="bg-white border-[0.5px] border-dashed border-[#ccc] rounded-xl p-5 text-center mt-6">
                  <p className="text-[13px] text-[#888] mb-2.5">Have a question paper that's not listed? Help your fellow students.</p>
                  <Link to="/upload" className="text-[12px] font-medium text-primary border-[0.5px] border-primary px-4 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
                    + Upload a paper
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div>
                {syllabuses.map(syllabus => (
                  <div key={syllabus.id} className="bg-white border-[0.5px] border-border-subtle rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-subtle">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary-dark flex-shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-[#1a1a1a]">{course.name} — Course Syllabus</div>
                        <div className="text-[12px] text-[#888] mt-0.5">
                          {course.code} · {course.semester}th semester · {course.creditHours} credit hours · Updated {syllabus.createdAt instanceof Timestamp ? format(syllabus.createdAt.toDate(), 'yyyy') : '2024'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-bg-page rounded-lg p-2.5">
                          <div className="text-[10px] font-medium text-primary uppercase tracking-[0.05em] mb-0.5">Unit {i}</div>
                          <div className="text-[12px] text-[#1a1a1a]">Course Topic {i} Description</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end">
                      <a
                        href={syllabus.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary text-white text-[12px] font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-primary-dark transition-colors"
                      >
                        <Download size={14} />
                        Download syllabus PDF
                      </a>
                    </div>
                  </div>
                ))}
                
                {syllabuses.length === 0 && (
                  <div className="text-center py-10 text-[#888] text-sm bg-white border-[0.5px] border-border-subtle rounded-xl">
                    No syllabus uploaded yet.
                  </div>
                )}

                <div className="bg-white border-[0.5px] border-dashed border-[#ccc] rounded-xl p-5 text-center mt-6">
                  <p className="text-[13px] text-[#888] mb-2.5">Is this syllabus outdated? Upload the latest version.</p>
                  <Link to="/upload" className="text-[12px] font-medium text-primary border-[0.5px] border-primary px-4 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
                    + Upload syllabus
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {resources.map(resource => (
                    <div key={resource.id} className="bg-white border-[0.5px] border-border-subtle rounded-xl p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
                      <div className={cn(
                        "w-9.5 h-9.5 rounded-lg flex items-center justify-center flex-shrink-0",
                        resource.type === 'Book' ? "bg-[#E6F1FB] text-[#0C447C]" : 
                        resource.type === 'Notes' ? "bg-[#FAEEDA] text-[#633806]" : "bg-[#EEEDFE] text-[#3C3489]"
                      )}>
                        {resource.type === 'Book' ? <Book size={18} /> : 
                         resource.type === 'Notes' ? <FileText size={18} /> : <Layers size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#1a1a1a] leading-[1.3] truncate" title={resource.title}>
                          {resource.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                            resource.type === 'Book' ? "bg-[#E6F1FB] text-[#0C447C]" : 
                            resource.type === 'Notes' ? "bg-[#FAEEDA] text-[#633806]" : "bg-[#EEEDFE] text-[#3C3489]"
                          )}>
                            {resource.type}
                          </span>
                          <span className="text-[11px] text-[#888]">Admin</span>
                        </div>
                      </div>
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg border-[0.5px] border-[#ccc] flex items-center justify-center text-[#888] hover:text-primary hover:border-primary transition-colors"
                      >
                        <Download size={12} />
                      </a>
                    </div>
                  ))}
                </div>
                
                {resources.length === 0 && (
                  <div className="text-center py-10 text-[#888] text-sm bg-white border-[0.5px] border-border-subtle rounded-xl">
                    No study resources available yet.
                  </div>
                )}

                <div className="bg-white border-[0.5px] border-dashed border-[#ccc] rounded-xl p-5 text-center mt-6">
                  <p className="text-[13px] text-[#888] mb-2.5">Have a useful book, note, or slide deck? Share it with others.</p>
                  <Link to="/upload" className="text-[12px] font-medium text-primary border-[0.5px] border-primary px-4 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
                    + Upload a resource
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
