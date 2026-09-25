import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleBookmarkExperience: (experienceId: string) => Promise<boolean>;
  isExperienceBookmarked: (experienceId: string) => boolean;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'sahoopitendrakumar@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isAdmin = Boolean(
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    userProfile?.role === 'admin'
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isUserAdmin = Boolean(
          currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        );
        const defaultProfile: UserProfile = {
          userId: currentUser.uid,
          name: currentUser.displayName || 'Student',
          email: currentUser.email || '',
          college: '',
          branch: 'Computer Science',
          degree: 'B.Tech',
          graduationYear: new Date().getFullYear(),
          photoURL: currentUser.photoURL || '',
          role: isUserAdmin ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        };

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            // Ensure admin check is synced
            if (isUserAdmin && data.role !== 'admin') {
              try {
                await updateDoc(userDocRef, { role: 'admin' });
              } catch (e) {
                console.warn('Sync admin role notice:', e);
              }
              data.role = 'admin';
            }
            setUserProfile(data);
          } else {
            // New user registration
            try {
              await setDoc(userDocRef, defaultProfile);
            } catch (setErr) {
              console.warn('Set initial profile notice:', setErr);
            }
            setUserProfile(defaultProfile);
            // Prompt to complete profile
            setIsProfileModalOpen(true);
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isOffline =
            errMsg.includes('offline') ||
            errMsg.includes('unavailable') ||
            err?.code === 'unavailable';

          if (isOffline) {
            console.warn('Firestore offline or connecting; falling back to current auth session profile:', errMsg);
            setUserProfile(defaultProfile);
          } else {
            console.error('Error fetching user profile:', err);
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in failed:', err);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { ...data });
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isExperienceBookmarked = (experienceId: string): boolean => {
    if (!userProfile?.bookmarkedExperienceIds) return false;
    return userProfile.bookmarkedExperienceIds.includes(experienceId);
  };

  const toggleBookmarkExperience = async (experienceId: string): Promise<boolean> => {
    if (!user) {
      await signInWithGoogle();
      return false;
    }

    const currentBookmarks = userProfile?.bookmarkedExperienceIds || [];
    const isBookmarked = currentBookmarks.includes(experienceId);
    const newBookmarks = isBookmarked
      ? currentBookmarks.filter((id) => id !== experienceId)
      : [...currentBookmarks, experienceId];

    // Optimistic local update
    setUserProfile((prev) => (prev ? { ...prev, bookmarkedExperienceIds: newBookmarks } : null));

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        bookmarkedExperienceIds: isBookmarked
          ? arrayRemove(experienceId)
          : arrayUnion(experienceId),
      });

      // Also sync bookmark on experience document
      try {
        const expDocRef = doc(db, 'experiences', experienceId);
        await updateDoc(expDocRef, {
          bookmarkedBy: isBookmarked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        });
      } catch (expErr) {
        console.warn('Could not sync bookmark to experience document:', expErr);
      }

      return !isBookmarked;
    } catch (err) {
      // Revert optimistic update on failure
      setUserProfile((prev) => (prev ? { ...prev, bookmarkedExperienceIds: currentBookmarks } : null));
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      return isBookmarked;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        signInWithGoogle,
        logout,
        updateUserProfile,
        toggleBookmarkExperience,
        isExperienceBookmarked,
        isProfileModalOpen,
        setIsProfileModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
