export interface Faculty {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  facultyId: string;
  paperCount?: number;
  courseCount?: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  semester: number;
  departmentId: string;
  prerequisites: string;
  paperCount?: number;
  resourceCount?: number;
}

export interface QuestionPaper {
  id: string;
  courseId: string;
  examType: 'Midterm' | 'Final';
  season: 'Spring' | 'Autumn';
  year: number;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: any;
}

export interface Syllabus {
  id: string;
  courseId: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: any;
}

export interface Resource {
  id: string;
  courseId: string;
  title: string;
  type: 'Book' | 'Notes' | 'Slides';
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'moderator' | 'admin';
}

export type ContentType = 'QuestionPaper' | 'Syllabus' | 'Resource';
