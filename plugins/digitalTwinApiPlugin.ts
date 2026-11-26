import type { Connect } from 'vite';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { completeDigitalTwinChat, parseChatRequestBody } from '../server/openrouterChat';
import {
  acquireSlot,
  checkRateLimit,
  clientIp,
  DEV_SECURITY_HEADERS,
  isOriginAllowed,
  LIMITS,
  releaseSlot,
  SECURITY_HEADERS,
} from '../server/security';

class BodyTooLargeError extends Error {}

function readBody(req: Connect.IncomingMessage, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length'] ?? 0);
    if (declared > maxBytes) {
      reject(new BodyTooLargeError());
      return;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new BodyTooLargeError());
        req.destroy();
        return;
      }
      chunks.push(Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: Connect.ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function securityHeadersMiddleware(headers: Record<string, string>): Connect.NextHandleFunction {
  return (_req, res, next) => {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    next();
  };
}

function createChatMiddleware(apiKey: string | undefined): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url !== '/api/chat') {
      next();
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    if (!isOriginAllowed(req.headers)) {
      sendJson(res, 403, { error: 'Forbidden' });
      return;
    }

    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
      sendJson(res, 415, { error: 'Unsupported media type' });
      return;
    }

    if (!apiKey) {
      console.error('[digital-twin] OPENROUTER_API_KEY is not configured');
      sendJson(res, 503, { error: 'The Digital Twin is unavailable right now.' });
      return;
    }

    const ip = clientIp(req.headers, req.socket.remoteAddress);
    const rate = checkRateLimit(ip);
    if (!rate.ok) {
      res.setHeader('Retry-After', '60');
      sendJson(res, 429, { error: rate.reason });
      return;
    }

    let raw: string;
    try {
      raw = await readBody(req, LIMITS.maxBodyBytes);
    } catch (err) {
      if (err instanceof BodyTooLargeError) {
        sendJson(res, 413, { error: 'Message too long.' });
      } else {
        sendJson(res, 400, { error: 'Invalid request.' });
      }
      return;
    }

    const body = parseChatRequestBody(raw);
    if (!body) {
      sendJson(res, 400, {
        error: `Invalid request. Keep messages under ${LIMITS.maxMessageChars} characters.`,
      });
      return;
    }

    if (!acquireSlot()) {
      res.setHeader('Retry-After', '10');
      sendJson(res, 503, { error: 'The Digital Twin is busy. Please try again in a moment.' });
      return;
    }

    try {
      const result = await completeDigitalTwinChat(apiKey, body.messages);
      sendJson(res, 'error' in result ? 502 : 200, result);
    } catch (err) {
      console.error('[digital-twin] unexpected error:', (err as Error).message);
      sendJson(res, 500, { error: 'Unexpected server error.' });
    } finally {
      releaseSlot();
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
      server.middlewares.use(securityHeadersMiddleware(DEV_SECURITY_HEADERS));
      server.middlewares.use(createChatMiddleware(apiKey));
    },
    configurePreviewServer(server) {
      server.middlewares.use(securityHeadersMiddleware(SECURITY_HEADERS));
      server.middlewares.use(createChatMiddleware(apiKey));
    },
  };
}
