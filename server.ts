import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const SHEET_SECRET_KEYS: Record<string, string> = {
  systemdb: 'SYSTEMDB',
  intraregion: 'INTRAREGION',
  interregion: 'INTERREGION',
  regiondb: 'REGIONDB',
};

function isAllowedUpstreamUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

app.get('/api/sheets/:source', async (req, res) => {
  const source = String(req.params.source || '').toLowerCase();
  const envKey = Object.prototype.hasOwnProperty.call(SHEET_SECRET_KEYS, source)
    ? SHEET_SECRET_KEYS[source]
    : null;

  if (!envKey) {
    res.status(404).json({ error: 'Unknown data source' });
    return;
  }

  const secretUrl = process.env[envKey]?.trim();
  if (!secretUrl) {
    res.status(503).json({
      error: `Required secret ${envKey} is not configured`,
    });
    return;
  }

  if (!isAllowedUpstreamUrl(secretUrl)) {
    res.status(500).json({
      error: `Invalid URL configured for secret ${envKey}`,
    });
    return;
  }

  try {
    const upstreamResponse = await fetch(secretUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });

    if (!upstreamResponse.ok) {
      res.status(502).json({
        error: `Upstream request failed for ${envKey} (status ${upstreamResponse.status})`,
      });
      return;
    }

    const tsvData = await upstreamResponse.text();
    res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(tsvData);
  } catch {
    res.status(502).json({
      error: `Unable to fetch upstream data for ${envKey}`,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
