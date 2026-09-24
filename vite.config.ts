import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {GoogleGenAI} from '@google/genai';

function geminiApiPlugin() {
  return {
    name: 'gemini-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/prepare' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const {experience} = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'GEMINI_API_KEY is not configured on server'}));
                return;
              }
              const ai = new GoogleGenAI({apiKey});
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
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(text);
            } catch (err: any) {
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({error: err.message || 'Failed to generate prep plan'}));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
