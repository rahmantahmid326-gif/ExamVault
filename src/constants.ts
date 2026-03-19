import { Faculty, Department } from './types';

export const FACULTIES: Faculty[] = [
  { id: 'f-se', name: 'Faculty of Science & Engineering' },
  { id: 'f-bs', name: 'Faculty of Business Studies' },
  { id: 'f-ah', name: 'Faculty of Arts & Humanities' },
  { id: 'f-ss', name: 'Faculty of Social Sciences' },
  { id: 'f-sis', name: 'Faculty of Shari\'ah & Islamic Studies' },
  { id: 'f-law', name: 'Faculty of Law' },
];

export const DEPARTMENTS: Department[] = [
  { id: 'cse', name: 'Computer Science & Engineering', facultyId: 'f-se' },
  { id: 'eee', name: 'Electrical & Electronic Engineering', facultyId: 'f-se' },
  { id: 'ete', name: 'Electronic & Telecommunication Engineering', facultyId: 'f-se' },
  { id: 'ce', name: 'Civil Engineering', facultyId: 'f-se' },
  { id: 'pharm', name: 'Pharmacy', facultyId: 'f-se' },
  { id: 'bba', name: 'Business Administration', facultyId: 'f-bs' },
  { id: 'eb', name: 'English for Business', facultyId: 'f-bs' },
  { id: 'ell', name: 'English Language & Literature', facultyId: 'f-ah' },
  { id: 'econ', name: 'Economics', facultyId: 'f-ss' },
  { id: 'qsis', name: 'Quranic Sciences & Islamic Studies', facultyId: 'f-sis' },
  { id: 'dis', name: 'Dawah & Islamic Studies', facultyId: 'f-sis' },
  { id: 'law', name: 'Law', facultyId: 'f-law' },
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
export const EXAM_TYPES = ['Midterm', 'Final'];
export const SEASONS = ['Spring', 'Autumn'];
export const RESOURCE_TYPES = ['Book', 'Notes', 'Slides'];
