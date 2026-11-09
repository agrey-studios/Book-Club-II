import type { IncomingMessage, ServerResponse } from 'http';
import { 
  askStudyAssistant, 
  summarizeNotes, 
  generateRevisionQuestions, 
  generateFlashcards, 
  generateStudyPlan 
} from './geminiService.ts';

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/')) {
    return false;
  }

  // Helper to read JSON body
  const readBody = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on('error', reject);
    });
  };

  const sendJson = (statusCode: number, data: any) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    if (url === '/api/ai/assistant' && req.method === 'POST') {
      const body = await readBody();
      const result = await askStudyAssistant(body);
      sendJson(200, result);
      return true;
    }

    if (url === '/api/ai/summarize' && req.method === 'POST') {
      const body = await readBody();
      const result = await summarizeNotes(body);
      sendJson(200, result);
      return true;
    }

    if (url === '/api/ai/questions' && req.method === 'POST') {
      const body = await readBody();
      const result = await generateRevisionQuestions(body);
      sendJson(200, result);
      return true;
    }

    if (url === '/api/ai/flashcards' && req.method === 'POST') {
      const body = await readBody();
      const result = await generateFlashcards(body);
      sendJson(200, result);
      return true;
    }

    if (url === '/api/ai/planner' && req.method === 'POST') {
      const body = await readBody();
      const result = await generateStudyPlan(body);
      sendJson(200, result);
      return true;
    }

    if (url === '/api/payments/mpesa-simulate' && req.method === 'POST') {
      const body = await readBody();
      const { phoneNumber, amountKsh, itemTitle } = body;
      
      // Simulate real Kenyan M-Pesa STK push processing
      const refChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let transactionRef = 'BKC';
      for (let i = 0; i < 7; i++) {
        transactionRef += refChars.charAt(Math.floor(Math.random() * refChars.length));
      }

      sendJson(200, {
        success: true,
        transactionRef,
        amountKsh,
        phoneNumber,
        itemTitle,
        timestamp: new Date().toISOString(),
        message: `Payment of KSh ${amountKsh} for "${itemTitle}" completed via M-Pesa (${transactionRef}). Receipt sent to ${phoneNumber}.`
      });
      return true;
    }

    // Unmatched API route
    sendJson(404, { error: 'API route not found' });
    return true;
  } catch (error: any) {
    console.error('API Error:', error);
    sendJson(500, { error: error?.message || 'Internal server error' });
    return true;
  }
}
