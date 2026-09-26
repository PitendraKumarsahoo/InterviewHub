import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route for interview preparation plan
app.post('/api/prepare', async (req, res) => {
  try {
    const { experience } = req.body || {};
    if (!experience) {
      res.status(400).json({ error: 'Missing experience payload' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server' });
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
    console.error('Server /api/prepare error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate prep plan' });
  }
});

// Production static assets or Vite middleware in dev
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupServer();
