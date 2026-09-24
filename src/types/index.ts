export type InterviewType = 'Campus' | 'Off-campus' | 'Internship' | 'PPO';
export type InterviewResult = 'Selected' | 'Not Selected' | 'Waitlisted' | 'Prefer not to say';
export type DifficultyLevel = 'Easy' | 'Moderate' | 'Difficult';
export type QuestionType = 'Technical' | 'Coding' | 'Aptitude' | 'GD' | 'HR' | 'Other';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  college?: string;
  branch?: string;
  degree?: string;
  graduationYear?: number;
  photoURL?: string;
  role: 'student' | 'admin';
  bookmarkedExperienceIds?: string[];
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: string;
  logo?: string;
  description: string;
  experienceCount: number;
  questionCount: number;
  viewCount: number;
  createdAt: string;
}

export interface RoundDetail {
  roundName: string;
  questions: string[];
}

export interface InterviewExperience {
  id: string;
  userId: string;
  authorName: string;
  authorCollege?: string;
  companyId: string;
  companyName: string;
  role: string;
  interviewType: InterviewType;
  year: number;
  result: InterviewResult;
  difficulty: DifficultyLevel;
  rounds: RoundDetail[];
  technologies: string[];
  tags?: string[];
  experienceText: string;
  advice?: string;
  overallRating?: number;
  upvotes?: number;
  upvotedBy?: string[];
  bookmarkedBy?: string[];
  status: ModerationStatus;
  createdAt: string;
}

export interface Question {
  id: string;
  companyId?: string;
  companyName?: string;
  experienceId?: string;
  type: QuestionType;
  questionText: string;
  normalizedText?: string;
  technology?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  language?: string;
  solution?: string;
  explanation?: string;
  askedCount: number;
  askedByUserIds?: string[];
  upvotes?: number;
  upvotedBy?: string[];
  status: 'approved' | 'pending';
  companiesAsked?: string[];
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  authorName: string;
  authorCollege?: string;
  answerText: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: string;
}

export interface PreparePlan {
  summary: string;
  keyTopics: string[];
  likelyQuestions: string[];
  codingFocus: string[];
  recommendedStudyPlan: string[];
  proTips: string[];
}
