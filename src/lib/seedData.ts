import { Company, InterviewExperience, Question } from '../types';

// Zero mock/dummy data: The platform begins completely empty and populates exclusively via live Firestore submissions.
export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_EXPERIENCES: InterviewExperience[] = [];
export const INITIAL_QUESTIONS: Question[] = [];

export async function checkAndSeedInitialData(): Promise<{ success: boolean; message: string }> {
  // Deliberately no-op: Real user submissions only.
  return { success: true, message: 'Live mode active - no dummy data seeded.' };
}
