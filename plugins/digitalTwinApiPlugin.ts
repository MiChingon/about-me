import type { Connect } from 'vite';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { completeDigitalTwinChat, parseChatRequestBody } from '../server/openrouterChat';

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: Connect.ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function createChatMiddleware(apiKey: string | undefined): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url !== '/api/chat') {
      next();
      return;
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    if (!apiKey) {
      sendJson(res, 500, {
        error: 'OPENROUTER_API_KEY is not configured. Add it to your .env file.',
      });
      return;
    }

    try {
      const raw = await readBody(req);
      const body = parseChatRequestBody(raw);
      if (!body) {
        sendJson(res, 400, { error: 'Invalid request body. Expected { messages: ChatMessage[] }.' });
        return;
      }

      const result = await completeDigitalTwinChat(apiKey, body.messages);
      if ('error' in result) {
        sendJson(res, 502, result);
        return;
      }

      sendJson(res, 200, result);
    } catch {
      sendJson(res, 500, { error: 'Unexpected server error.' });
    }
  };
}

export function digitalTwinApiPlugin(): Plugin {
  let apiKey: string | undefined;

  return {
    name: 'digital-twin-api',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), '');
      apiKey = env.OPENROUTER_API_KEY;
    },
    configureServer(server) {
      server.middlewares.use(createChatMiddleware(apiKey));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createChatMiddleware(apiKey));
    },
  };
}
