import { GoogleGenAI, ThinkingLevel } from '@google/genai';

// Initialize Gemini client with telemetry header
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function askStudyAssistant(params: {
  question: string;
  educationLevel: string;
  subject?: string;
  contextText?: string;
  complexReasoning?: boolean;
}) {
  const ai = getGeminiClient();
  const { question, educationLevel, subject, contextText, complexReasoning = true } = params;

  const systemInstruction = `You are the Book Club AI Academic Study Assistant, an expert, encouraging tutor specialized in curriculum across Primary, Junior Secondary (JSS), Senior Secondary, and College/University levels.
Tailor your explanation strictly to the student's education level: ${educationLevel}.
${subject ? `Subject: ${subject}.` : ''}
Explain concepts clearly, give real-world step-by-step examples, structure with clear headings, bullet points, and highlight key definitions.
Be academically rigorous, accurate, and encouraging.`;

  const userPrompt = `${contextText ? `Document Context:\n${contextText}\n\n` : ''}Student Question: ${question}`;

  try {
    // If complex reasoning is required, use gemini-4-argon with ThinkingLevel.HIGH without maxOutputTokens
    if (complexReasoning) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-argon',
          contents: userPrompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          },
        });
        return { text: response.text ?? 'No response generated.', modelUsed: 'gemini-4-argon (High Thinking)' };
      } catch (err: any) {
        console.warn('Fallback from gemini-4-argon to gemini-3.8-flash:', err?.message);
      }
    }

    // Default or fallback to gemini-3.8-flash
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });
    return { text: fallbackResponse.text ?? 'No response generated.', modelUsed: 'gemini-3.8-flash' };
  } catch (error: any) {
    console.error('Gemini Study Assistant Error:', error);
    throw new Error(error?.message || 'Failed to generate study guidance');
  }
}

export async function summarizeNotes(params: {
  title: string;
  content: string;
  educationLevel: string;
}) {
  const ai = getGeminiClient();
  const { title, content, educationLevel } = params;

  const systemInstruction = `You are an academic summarization specialist for Book Club.
Given study notes or textbook chapters, produce:
1. Executive Summary (2-3 concise paragraphs)
2. Core Concepts & Definitions
3. Key Takeaways (Bullet points)
4. Likely Examination Questions & Answering Tips
Tailor the language to ${educationLevel}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Material Title: ${title}\n\nText:\n${content.slice(0, 15000)}`,
      config: {
        systemInstruction,
      },
    });
    return { summary: response.text ?? 'Summary could not be generated.' };
  } catch (err: any) {
    console.error('Gemini Summarize Error:', err);
    throw new Error(err?.message || 'Failed to summarize notes');
  }
}

export async function generateRevisionQuestions(params: {
  topic: string;
  subject: string;
  educationLevel: string;
  count?: number;
}) {
  const ai = getGeminiClient();
  const { topic, subject, educationLevel, count = 5 } = params;

  const prompt = `Generate ${count} academic revision questions for education level: "${educationLevel}", subject: "${subject}", topic: "${topic}".
Output valid JSON array with objects formatted like:
[
  {
    "id": "q1",
    "question": "What is...",
    "type": "multiple_choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Because...",
    "marks": 2
  }
]
Only output valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return { questions: parsed };
  } catch (err: any) {
    console.error('Gemini Question Generator Error:', err);
    throw new Error(err?.message || 'Failed to generate revision questions');
  }
}

export async function generateFlashcards(params: {
  topic: string;
  subject: string;
  educationLevel: string;
}) {
  const ai = getGeminiClient();
  const { topic, subject, educationLevel } = params;

  const prompt = `Generate 6 high-yield study flashcards for education level: "${educationLevel}", subject: "${subject}", topic: "${topic}".
Output valid JSON array with objects formatted like:
[
  {
    "id": "f1",
    "front": "Term or Key Question",
    "back": "Clear concise definition or explanation",
    "category": "${subject}"
  }
]
Only output valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const parsed = JSON.parse(response.text || '[]');
    return { flashcards: parsed };
  } catch (err: any) {
    console.error('Gemini Flashcards Error:', err);
    throw new Error(err?.message || 'Failed to generate flashcards');
  }
}

export async function generateStudyPlan(params: {
  educationLevel: string;
  subjects: string[];
  hoursPerDay: number;
  examDate?: string;
  goals: string;
}) {
  const ai = getGeminiClient();
  const { educationLevel, subjects, hoursPerDay, examDate, goals } = params;

  const prompt = `Create a realistic, motivating 7-day academic study timetable for a ${educationLevel} student.
Subjects to cover: ${subjects.join(', ')}.
Available study time: ${hoursPerDay} hours per day.
Exam target: ${examDate || 'Upcoming exams'}.
Student Goal: ${goals}.
Include structured daily blocks (Subject, Focus Topic, Active Recall technique, Break times). Include revision strategies (spaced repetition, past paper practice). Format with clean markdown headers and tables.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return { plan: response.text ?? 'Study plan could not be generated.' };
  } catch (err: any) {
    console.error('Gemini Study Plan Error:', err);
    throw new Error(err?.message || 'Failed to generate study schedule');
  }
}
