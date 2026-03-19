import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload as UploadIcon, 
  FileText, 
  Book, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  X,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DEPARTMENTS, EXAM_TYPES, SEASONS, RESOURCE_TYPES } from '../constants';
import { getCourses, submitContent } from '../services/firestore';
import { uploadFile } from '../services/storage';
import { Course, ContentType } from '../types';
import { cn } from '../App';

export default function UploadPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [type, setType] = React.useState<ContentType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form State
  const [deptId, setDeptId] = React.useState('');
  const [courseId, setCourseId] = React.useState('');
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [examType, setExamType] = React.useState('');
  const [season, setSeason] = React.useState('');
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [resourceType, setResourceType] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  React.useEffect(() => {
    if (deptId) {
      getCourses(deptId).then(data => setCourses(data || []));
    }
  }, [deptId]);

  const handleSubmit = async () => {
    if (!file || !courseId || !type) return;

    setLoading(true);
    setError(null);

    try {
      const collectionName = 
        type === 'QuestionPaper' ? 'question_papers' : 
        type === 'Syllabus' ? 'syllabuses' : 'resources';
      
      const fileUrl = await uploadFile(file, collectionName);
      
      const payload: any = {
        courseId,
        fileUrl,
      };

      if (type === 'QuestionPaper') {
        payload.examType = examType;
        payload.season = season;
        payload.year = Number(year);
      } else if (type === 'Resource') {
        payload.type = resourceType;
        payload.title = title;
      }

      await submitContent(collectionName, payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (success) {
    return (
      <div className="max-w-[640px] mx-auto px-4 sm:px-8 py-10">
        <div className="bg-white border-[0.5px] border-border-subtle rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 text-primary-dark">
            <CheckCircle size={24} />
          </div>
          <h2 className="text-[22px] font-serif mb-2">Submitted for review</h2>
          <p className="text-[13px] text-[#888] leading-[1.6] max-w-[340px] mx-auto mb-6">
            Thank you for contributing! An admin will review your upload and publish it within 1–2 days.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setType(null);
              setFile(null);
              setDeptId('');
              setCourseId('');
            }}
            className="bg-primary text-white text-[13px] font-medium px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-serif mb-1.5">Upload a resource</h1>
      <p className="text-[13px] text-[#666] mb-8 leading-[1.6]">
        Contribute to the community. All uploads are reviewed by an admin before going live.
      </p>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium",
            step === 1 ? "bg-primary-dark text-white" : "bg-primary text-white"
          )}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={cn("text-[12px] font-medium", step === 1 ? "text-[#1a1a1a]" : "text-[#888]")}>Select type</div>
        </div>
        <div className={cn("flex-1 h-[0.5px] mx-2.5 min-w-[20px]", step > 1 ? "bg-primary" : "bg-border-subtle")} />
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium",
            step === 2 ? "bg-primary-dark text-white" : step > 2 ? "bg-primary text-white" : "bg-bg-page text-[#888] border-[0.5px] border-[#ccc]"
          )}>
            {step > 2 ? '✓' : '2'}
          </div>
          <div className={cn("text-[12px] font-medium", step === 2 ? "text-[#1a1a1a]" : "text-[#888]")}>Fill details</div>
        </div>
        <div className={cn("flex-1 h-[0.5px] mx-2.5 min-w-[20px]", step > 2 ? "bg-primary" : "bg-border-subtle")} />
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium",
            step === 3 ? "bg-primary-dark text-white" : "bg-bg-page text-[#888] border-[0.5px] border-[#ccc]"
          )}>
            3
          </div>
          <div className={cn("text-[12px] font-medium", step === 3 ? "text-[#1a1a1a]" : "text-[#888]")}>Upload file</div>
        </div>
      </div>

      <div className="bg-white border-[0.5px] border-border-subtle rounded-xl p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {[
                  { id: 'QuestionPaper', name: 'Question paper', icon: FileText, desc: 'Past exam question papers' },
                  { id: 'Syllabus', name: 'Syllabus', icon: Book, desc: 'Course syllabus PDF' },
                  { id: 'Resource', name: 'Resource', icon: Layers, desc: 'Books, notes, slides' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setType(item.id as any)}
                    className={cn(
                      "border-[0.5px] rounded-xl p-4 text-center transition-all",
                      type === item.id ? "border-primary bg-primary-light" : "border-[#ccc] bg-bg-page hover:border-primary"
                    )}
                  >
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center mx-auto mb-2.5 text-[#888]">
                      <item.icon size={18} className={type === item.id ? "text-primary-dark" : ""} />
                    </div>
                    <div className="text-[13px] font-medium text-[#1a1a1a]">{item.name}</div>
                    <div className="text-[11px] text-[#888] mt-0.5 leading-[1.4]">{item.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  disabled={!type}
                  onClick={() => setStep(2)}
                  className="bg-primary-dark text-white text-[13px] font-medium px-7 py-2.5 rounded-lg disabled:bg-bg-page disabled:text-[#888] disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Department <span className="text-red-500">*</span></label>
                  <select
                    className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Course <span className="text-red-500">*</span></label>
                  <select
                    disabled={!deptId}
                    className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary disabled:opacity-50"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">Select department first...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                  </select>
                </div>

                {type === 'QuestionPaper' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Exam type <span className="text-red-500">*</span></label>
                      <select
                        className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                      >
                        <option value="">Select...</option>
                        {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Exam season <span className="text-red-500">*</span></label>
                      <select
                        className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                      >
                        <option value="">Select...</option>
                        {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Year <span className="text-red-500">*</span></label>
                      <select
                        className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                      >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {type === 'Syllabus' && (
                  <div>
                    <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Academic year <span className="text-red-500">*</span></label>
                    <select
                      className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}

                {type === 'Resource' && (
                  <>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Resource type <span className="text-red-500">*</span></label>
                      <select
                        className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                      >
                        <option value="">Select...</option>
                        {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Title <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Introduction to Machine Learning"
                        className="w-full bg-bg-page border-[0.5px] border-[#ccc] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-[13px] text-[#888] border-[0.5px] border-[#ccc] px-5 py-2 rounded-lg hover:bg-bg-page transition-colors"
                >
                  ← Back
                </button>
                <button
                  disabled={!deptId || !courseId}
                  onClick={() => setStep(3)}
                  className="bg-primary-dark text-white text-[13px] font-medium px-7 py-2.5 rounded-lg disabled:bg-bg-page disabled:text-[#888] disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-[#FAEEDA] border-[0.5px] border-[#EF9F27] rounded-lg p-3.5 flex gap-2.5 mb-6">
                <AlertCircle size={16} className="text-[#633806] flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#633806] leading-[1.5]">
                  Your upload will be reviewed by an admin before it appears on the site. This usually takes 1–2 days.
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-[12px] font-medium text-[#1a1a1a] mb-1.5">Upload file <span className="text-red-500">*</span></label>
                <div 
                  className={cn(
                    "border-[1.5px] border-dashed rounded-xl p-8 text-center cursor-pointer transition-all bg-bg-page",
                    file ? "border-primary bg-primary-light" : "border-[#ccc] hover:border-primary"
                  )}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <div className="w-10 h-10 bg-white border-[0.5px] border-border-subtle rounded-full flex items-center justify-center mx-auto mb-3 text-[#888]">
                    <UploadIcon size={18} />
                  </div>
                  <p className="text-[13px] text-[#888]">
                    <strong className="text-[#1a1a1a] font-medium">Click to upload</strong> or drag and drop
                  </p>
                  <div className="text-[11px] text-[#888] mt-1.5">PDF, JPG, or PNG · Max 20MB</div>
                </div>
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                
                {file && (
                  <div className="flex items-center gap-2.5 p-3 bg-white border-[0.5px] border-border-subtle rounded-lg mt-2.5">
                    <CheckCircle size={16} className="text-primary" />
                    <span className="text-[12px] text-[#1a1a1a] flex-1 truncate">{file.name}</span>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-[11px] text-[#888] hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-[12px] mb-4">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-[13px] text-[#888] border-[0.5px] border-[#ccc] px-5 py-2 rounded-lg hover:bg-bg-page transition-colors"
                >
                  ← Back
                </button>
                <button
                  disabled={!file || loading}
                  onClick={handleSubmit}
                  className="bg-primary text-white text-[13px] font-medium px-7 py-2.5 rounded-lg disabled:bg-bg-page disabled:text-[#888] disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? 'Uploading...' : 'Submit for review'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
