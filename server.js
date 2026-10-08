import http from 'node:http';
import { getDb } from './lib/db.js';
import * as auth from './lib/auth.js';
import { syncAll, trackedRepos } from './lib/github.js';
import { pageCatalog, pageRelease, pageAdmin, pageLogin, page404 } from './lib/views.js';

const PORT = Number(process.env.PORT || 3000);

function send(res, status, body, headers = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8');
  res.writeHead(status, { 'content-length': buf.length, ...headers });
  res.end(buf);
}

function json(res, status, obj, headers = {}) {
  send(res, status, JSON.stringify(obj), { 'content-type': 'application/json; charset=utf-8', ...headers });
}

function html(res, body, status = 200) {
  send(res, status, body, { 'content-type': 'text/html; charset=utf-8' });
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 1_000_000) throw new Error('payload too large');
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  const ct = String(req.headers['content-type'] || '');
  if (ct.includes('application/x-www-form-urlencoded')) {
    const out = {};
    for (const [k, v] of new URLSearchParams(raw)) out[k] = v;
    return out;
  }
  try { return JSON.parse(raw); } catch { return null; }
}

function authed(req) {
  const cookies = auth.parseCookies(req.headers.cookie);
  return auth.verifySession(cookies[auth.SESSION_COOKIE]);
}

function slugify(s) {
  const out = String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  return out || 'release';
}

function isoOrNow(v) {
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

const LIST_SQL = 'SELECT * FROM releases ORDER BY published_at DESC, id DESC';

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    const m = req.method;

    if (p === '/healthz') return json(res, 200, { ok: true });

    if (m === 'GET' && p === '/') {
      return html(res, pageCatalog(getDb().prepare(LIST_SQL).all()));
    }

    if (m === 'GET' && p.startsWith('/release/')) {
      const slug = decodeURIComponent(p.slice('/release/'.length));
      const r = getDb().prepare('SELECT * FROM releases WHERE slug = ?').get(slug);
      return r ? html(res, pageRelease(r)) : html(res, page404(), 404);
    }

    if (m === 'GET' && p === '/admin') {
      if (!authed(req)) return html(res, pageLogin());
      return html(res, pageAdmin(
        getDb().prepare(LIST_SQL).all(),
        trackedRepos(),
        !!process.env.GITHUB_TOKEN
      ));
    }

    if (m === 'POST' && p === '/api/login') {
      const b = await readBody(req);
      if (!b || !auth.checkPassword(b.password)) return json(res, 401, { error: 'Invalid password' });
      return json(res, 200, { ok: true }, { 'set-cookie': auth.sessionCookie(auth.makeSession()) });
    }

    if (m === 'POST' && p === '/api/logout') {
      return json(res, 200, { ok: true }, { 'set-cookie': auth.expiredCookie() });
    }

    if (m === 'POST' && p === '/api/sync') {
      if (!authed(req)) return json(res, 401, { error: 'unauthorized' });
      try {
        const result = await syncAll(getDb());
        return json(res, 200, result);
      } catch (e) {
        return json(res, 500, { error: String(e.message || e) });
      }
    }

    if (m === 'GET' && p === '/api/releases') {
      return json(res, 200, getDb().prepare(LIST_SQL).all());
    }

    if (m === 'POST' && p === '/api/releases') {
      if (!authed(req)) return json(res, 401, { error: 'unauthorized' });
      const b = await readBody(req);
      if (!b) return json(res, 400, { error: 'invalid body' });
      for (const k of ['name', 'version', 'download_url', 'repo']) {
        if (!b[k] || typeof b[k] !== 'string') return json(res, 400, { error: 'missing ' + k });
      }
      const slug = slugify(b.slug || (b.name + '-' + b.version));
      const abi = (typeof b.abi === 'string' && b.abi.trim()) || 'armeabi-v7a + arm64-v8a + x86_64';
      const changelog = typeof b.changelog === 'string' ? b.changelog : '';
      const tags = typeof b.tags === 'string' ? b.tags : '';
      const published_at = isoOrNow(b.published_at);
      try {
        const info = getDb().prepare(
          'INSERT INTO releases (slug, name, version, changelog, abi, download_url, repo, tags, published_at) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(slug, b.name, b.version, changelog, abi, b.download_url, b.repo, tags, published_at);
        const id = Number(info.lastInsertRowid);
        const row = getDb().prepare('SELECT * FROM releases WHERE id = ?').get(id);
        return json(res, 201, row);
      } catch (e) {
        if (String(e.message).includes('UNIQUE')) return json(res, 409, { error: 'slug already exists' });
        throw e;
      }
    }

    const mId = p.match(/^\/api\/releases\/(\d+)$/);
    if (mId) {
      const id = Number(mId[1]);
      const row = getDb().prepare('SELECT * FROM releases WHERE id = ?').get(id);
      if (!row) return json(res, 404, { error: 'not found' });

      if (m === 'GET') return json(res, 200, row);

      if (m === 'PATCH') {
        if (!authed(req)) return json(res, 401, { error: 'unauthorized' });
        const b = await readBody(req);
        if (!b) return json(res, 400, { error: 'invalid body' });
        const next = {
          name: typeof b.name === 'string' ? b.name : row.name,
          version: typeof b.version === 'string' ? b.version : row.version,
          changelog: typeof b.changelog === 'string' ? b.changelog : row.changelog,
          abi: (typeof b.abi === 'string' && b.abi.trim()) ? b.abi : row.abi,
          download_url: typeof b.download_url === 'string' ? b.download_url : row.download_url,
          repo: typeof b.repo === 'string' ? b.repo : row.repo,
          tags: typeof b.tags === 'string' ? b.tags : row.tags,
          published_at: b.published_at ? isoOrNow(b.published_at) : row.published_at
        };
        getDb().prepare(
          'UPDATE releases SET name=?, version=?, changelog=?, abi=?, download_url=?, repo=?, tags=?, published_at=? WHERE id=?'
        ).run(next.name, next.version, next.changelog, next.abi, next.download_url, next.repo, next.tags, next.published_at, id);
        return json(res, 200, getDb().prepare('SELECT * FROM releases WHERE id = ?').get(id));
      }

      if (m === 'DELETE') {
        if (!authed(req)) return json(res, 401, { error: 'unauthorized' });
        getDb().prepare('DELETE FROM releases WHERE id = ?').run(id);
        return json(res, 200, { ok: true });
      }
    }

    return html(res, page404(), 404);
  } catch (err) {
    console.error('[error]', err);
    if (!res.headersSent) json(res, 500, { error: 'server error' });
  }
});

server.listen(PORT, () => {
  console.log('Release Hub listening on http://localhost:' + PORT);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
