import { InterviewExperience, PreparePlan } from '../types';

export async function generatePreparationPlan(experience: InterviewExperience): Promise<PreparePlan> {
  try {
    const response = await fetch('/api/prepare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ experience }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn('API prepare failed, falling back to local synthesis:', error);
  }

  // Fallback synthesis based on experience data if server-side Gemini is unreachable
  return {
    summary: `Tailored preparation plan for ${experience.companyName} - ${experience.role} (${experience.interviewType} Drive). Evaluates core software engineering principles, problem solving, and role-specific depth.`,
    keyTopics: experience.technologies.length > 0
      ? experience.technologies.slice(0, 5).map(t => `${t} Core Fundamentals & Architecture`)
      : ['Data Structures & Algorithms', 'Object-Oriented Programming', 'DBMS & SQL Joins', 'System Design Basics', 'Operating Systems & Threading'],
    likelyQuestions: [
      `Deep dive into ${experience.technologies[0] || 'OOP'} concepts and memory model`,
      `Explain your most complex project architecture and your contribution`,
      `Live coding: String manipulation, Two-pointers, or Hash map problem`,
      `Scenario-based query writing with multi-table joins and indexing`,
    ],
    codingFocus: [
      'Arrays & Strings: Two pointers, Sliding window, Frequency map',
      'Data Structures: Binary Trees traversal, Graph BFS/DFS, Linked List cycle',
    ],
    recommendedStudyPlan: [
      'Stage 1 (Days 1-2): Master fundamentals of ' + (experience.technologies.join(', ') || 'Core CS subjects'),
      'Stage 2 (Days 3-4): Practice 15-20 company-specific repeated coding and SQL questions',
      'Stage 3 (Day 5): Rehearse project explanations, technical trade-offs, and HR scenario answers',
    ],
    proTips: [
      `Review candidate advice: "${experience.advice || 'Be transparent about your thought process during coding.'}"`,
      'Always clarify problem constraints before writing code.',
    ],
  };
}
