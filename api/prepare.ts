import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Only POST is supported.' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use raw body
      }
    }

    const { experience } = body || {};
    if (!experience) {
      res.status(400).json({ error: 'Missing experience payload in request body' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured on Vercel. Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.',
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert technical interview coach for university students.
Analyze this real student interview experience:
Company: ${experience.companyName || 'Unknown'}
Role: ${experience.role || 'Software Engineer'}
Interview Type: ${experience.interviewType || 'Campus'}
Difficulty: ${experience.difficulty || 'Moderate'}
Result: ${experience.result || 'Selected'}
Technologies: ${(experience.technologies || []).join(', ')}
Rounds & Questions: ${JSON.stringify(experience.rounds || [])}
Description: ${experience.experienceText || ''}
Advice: ${experience.advice || ''}

Generate a structured, actionable preparation guide for a junior preparing for this interview.
Return a valid JSON object with the following keys:
{
  "summary": "Brief 1-2 sentence overview of what this company tests and looks for",
  "keyTopics": ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"],
  "likelyQuestions": ["question 1", "question 2", "question 3", "question 4"],
  "codingFocus": ["concept 1 with sample problem", "concept 2 with sample problem"],
  "recommendedStudyPlan": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "proTips": ["tip 1", "tip 2"]
}
Only output the raw JSON object, without markdown blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let text = response.text || '{}';
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Vercel serverless /api/prepare error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate interview preparation plan',
    });
  }
}
