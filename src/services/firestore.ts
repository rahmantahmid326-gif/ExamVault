import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  setDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { QuestionPaper, Syllabus, Resource, Course, UserProfile } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Courses
export const getCourses = async (departmentId: string) => {
  const path = 'courses';
  try {
    const q = query(collection(db, path), where('departmentId', '==', departmentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

// Content (Question Papers, Syllabuses, Resources)
export const getApprovedContent = (collectionName: string, courseId: string, callback: (data: any[]) => void) => {
  const q = query(
    collection(db, collectionName), 
    where('courseId', '==', courseId),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  });
};

export const getPendingContent = (callback: (data: any[]) => void) => {
  const collections = ['question_papers', 'syllabuses', 'resources'];
  
  // This is a bit tricky with multiple collections, but for moderation we can just fetch all pending
  // In a real app we might have a single 'submissions' collection
  // For now, let's just listen to one as an example or combine them in the UI
};

export const submitContent = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      status: 'pending',
      submittedBy: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
};

export const updateContentStatus = async (collectionName: string, id: string, status: 'approved' | 'rejected') => {
  try {
    await updateDoc(doc(db, collectionName, id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, collectionName);
  }
};

// User Profile
export const getUserProfile = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const createUserProfile = async (uid: string, email: string) => {
  const path = `users/${uid}`;
  const isAdmin = email === 'rahmantahmid326@gmail.com';
  try {
    await setDoc(doc(db, 'users', uid), {
      email,
      role: isAdmin ? 'admin' : 'student'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};
