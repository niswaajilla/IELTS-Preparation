import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = Number(process.env.PORT) || 3000;

// Initialize Google Gen AI if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI();
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with environment key:', err);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Helper to strip markdown JSON formatting
function extractJson(raw: string): any {
  let cleaned = raw.trim();
  // Remove markdown codeblock ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  return JSON.parse(cleaned);
}

// Endpoint: Generate IELTS Academic Reading Passage and Questions
app.post('/api/reading/generate', async (req, res) => {
  try {
    const { topic, difficulty = 'medium' } = req.body;
    
    if (!process.env.GEMINI_API_KEY && !aiClient) {
      return res.status(503).json({
        error: 'AI_KEY_NOT_CONFIGURED',
        message: 'No GEMINI_API_KEY configured. Fallback tests will be used.'
      });
    }

    const ai = aiClient || new GoogleGenAI();
    const prompt = `
You are an expert Cambridge IELTS Academic test maker.
Create an authentic, high-quality IELTS Academic Reading passage and a set of 8-10 varied questions.
Target topic: ${topic || 'Academic Science, Ecology, Cognitive Science, History of Innovation, or Archaeology'}.
Difficulty level: ${difficulty}.

Requirements:
1. Passage: 650-800 words, formal academic tone (like The Economist, National Geographic, or Nature), divided into labeled paragraphs: [A], [B], [C], [D], [E], [F], [G].
2. Questions: Include 3 different IELTS question types:
   - "tfng": True / False / Not Given (3-4 questions)
   - "matching_headings": Matching Headings for paragraphs (list of Roman numeral headings i, ii, iii... matching to paragraphs) (3 questions)
   - "multiple_choice": 4 options (A, B, C, D) (2-3 questions)
   - "sentence_completion": complete sentence with exact word from passage (1-2 questions)
3. For EVERY question provide:
   - "correctAnswer": exact answer string
   - "explanationId": Detailed explanation in BAHASA INDONESIA, explaining why the answer is correct and why other options or FALSE/NOT GIVEN are ruled out. Keep key academic terms in ENGLISH.
   - "supportingQuote": Direct English quote from the passage proving the answer, mentioning the paragraph letter.
4. Extract 5-6 advanced academic vocabulary words from the passage with their definition, Indonesian meaning, and synonyms.

Return strictly valid JSON in the following schema:
{
  "id": "reading-${Date.now()}",
  "title": "Passage Title in English",
  "topic": "Topic Name",
  "wordCount": 720,
  "difficulty": "${difficulty}",
  "passage": "Full passage text with [A], [B], [C] markers...",
  "paragraphs": [
    { "letter": "A", "text": "Paragraph text..." },
    { "letter": "B", "text": "Paragraph text..." }
  ],
  "headingsList": [
    { "id": "i", "text": "Heading option text" },
    { "id": "ii", "text": "Heading option text" }
  ],
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "type": "tfng",
      "instruction": "Do the following statements agree with the information given in the Reading Passage? Choose TRUE, FALSE, or NOT GIVEN.",
      "statement": "Statement text...",
      "options": ["TRUE", "FALSE", "NOT GIVEN"],
      "correctAnswer": "TRUE",
      "paragraphTarget": "B",
      "explanationId": "Penjelasan detail dalam bahasa Indonesia dengan istilah kunci dalam bahasa Inggris...",
      "supportingQuote": "Direct quote from paragraph B..."
    },
    {
      "id": "q2",
      "number": 2,
      "type": "matching_headings",
      "instruction": "Choose the correct heading for Paragraph C from the list of headings.",
      "statement": "Paragraph C",
      "options": ["i", "ii", "iii", "iv", "v"],
      "correctAnswer": "ii",
      "paragraphTarget": "C",
      "explanationId": "Penjelasan mengapa heading ii cocok untuk paragraf C...",
      "supportingQuote": "Topic sentence and supporting ideas in paragraph C..."
    },
    {
      "id": "q3",
      "number": 3,
      "type": "multiple_choice",
      "instruction": "Choose the correct letter, A, B, C or D.",
      "question": "According to the passage, what is the primary factor...",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "B",
      "paragraphTarget": "D",
      "explanationId": "Penjelasan detail jawaban B...",
      "supportingQuote": "Direct quote from paragraph D..."
    },
    {
      "id": "q4",
      "number": 4,
      "type": "sentence_completion",
      "instruction": "Complete the sentence below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
      "statement": "Researchers observed that the phenomenon was triggered by [BLANK] during extreme weather.",
      "correctAnswer": "thermal variations",
      "acceptableAnswers": ["thermal variations", "thermal variation"],
      "paragraphTarget": "E",
      "explanationId": "Penjelasan pencarian kata kunci di paragraf E...",
      "supportingQuote": "The exact sentence containing the blank..."
    }
  ],
  "featuredVocab": [
    {
      "word": "mitigate",
      "partOfSpeech": "verb",
      "definition": "To make something less severe, harmful, or painful.",
      "indonesianMeaning": "Meringankan, mengurangi, meredakan",
      "synonyms": ["alleviate", "reduce", "diminish"],
      "example": "Innovative urban architecture helps mitigate the effects of global temperature rise."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      }
    });

    const text = response.text || '';
    const parsedData = extractJson(text);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating reading passage:', error);
    return res.status(500).json({
      error: 'GENERATION_FAILED',
      message: error?.message || 'Failed to generate passage with AI'
    });
  }
});

// Endpoint: Generate Academic Vocabulary by Theme
app.post('/api/vocab/generate', async (req, res) => {
  try {
    const { theme, count = 5 } = req.body;

    if (!process.env.GEMINI_API_KEY && !aiClient) {
      return res.status(503).json({
        error: 'AI_KEY_NOT_CONFIGURED',
        message: 'No GEMINI_API_KEY configured.'
      });
    }

    const ai = aiClient || new GoogleGenAI();
    const prompt = `
Generate ${count} high-frequency IELTS Academic vocabulary words suitable for Band 7.5 - 9.0 on the theme: "${theme}".
Return strictly valid JSON array of objects with the schema:
[
  {
    "word": "ubiquitous",
    "phonetic": "/juːˈbɪk.wɪ.təs/",
    "partOfSpeech": "adjective",
    "definition": "Present, appearing, or found everywhere at the same time.",
    "indonesianMeaning": "Ada di mana-mana / serba hadir",
    "synonyms": ["omnipresent", "pervasive", "universal"],
    "antonyms": ["rare", "scarce"],
    "example": "Smartphones have become ubiquitous in modern academic environments.",
    "theme": "${theme}"
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      }
    });

    const text = response.text || '';
    const parsed = extractJson(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating vocabulary:', error);
    return res.status(500).json({
      error: 'GENERATION_FAILED',
      message: error?.message || 'Failed to generate vocabulary'
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`IELTS PrepMaster server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
