function slugify(s) {
  const out = String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  return out || 'release';
}

export function trackedRepos() {
  return String(process.env.GITHUB_REPOS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function headers() {
  const h = {
    accept: 'application/vnd.github+json',
    'user-agent': 'release-hub'
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.authorization = 'Bearer ' + token;
  return h;
}

async function fetchReleases(repo) {
  const url = 'https://api.github.com/repos/' + repo + '/releases?per_page=30';
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('GitHub ' + res.status + ' for ' + repo + ': ' + text.slice(0, 200));
  }
  return res.json();
}

function detectAbi(assets) {
  const names = (assets || []).map(a => String(a.name || '').toLowerCase());
  const hasV7a = names.some(n => n.includes('v7a') || n.includes('armeabi'));
  const hasV8a = names.some(n => n.includes('v8a') || n.includes('arm64'));
  const hasX86_64 = names.some(n => n.includes('x86_64'));
  const parts = [];
  if (hasV7a) parts.push('armeabi-v7a');
  if (hasV8a) parts.push('arm64-v8a');
  if (hasX86_64) parts.push('x86_64');
  if (parts.length === 0) return 'armeabi-v7a + arm64-v8a + x86_64';
  return parts.join(' + ');
}

function pickDownload(rel) {
  const apk = (rel.assets || []).find(a => String(a.name || '').toLowerCase().endsWith('.apk'));
  return apk ? apk.browser_download_url : rel.html_url;
}

function upsertRelease(db, repo, rel) {
  const existing = db
    .prepare('SELECT * FROM releases WHERE source = ? AND external_id = ?')
    .get('github', String(rel.id));

  const abi = detectAbi(rel.assets);
  const version = String(rel.tag_name || '').replace(/^v/, '') || '0.0.0';
  const changelog = rel.body || '';
  const download_url = pickDownload(rel);
  const published_at = rel.published_at || new Date().toISOString();
  const repoName = repo.split('/')[1] || repo;
  const name = (rel.name && String(rel.name).trim()) || repoName;

  if (existing) {
    db.prepare(
      'UPDATE releases SET name=?, version=?, changelog=?, abi=?, download_url=?, repo=?, published_at=? WHERE id=?'
    ).run(name, version, changelog, abi, download_url, repo, published_at, existing.id);
    return { inserted: false, id: existing.id };
  }

  const baseSlug = slugify(repoName + '-' + version);
  let slug = baseSlug;
  let n = 2;
  while (db.prepare('SELECT 1 FROM releases WHERE slug = ?').get(slug)) {
    slug = baseSlug + '-' + n++;
  }
  const info = db.prepare(
    'INSERT INTO releases (slug, name, version, changelog, abi, download_url, repo, tags, published_at, source, external_id) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(slug, name, version, changelog, abi, download_url, repo, '', published_at, 'github', String(rel.id));
  return { inserted: true, id: Number(info.lastInsertRowid) };
}

export async function syncAll(db) {
  const repos = trackedRepos();
  if (repos.length === 0) {
    return { added: 0, updated: 0, repos: [], error: 'GITHUB_REPOS is empty' };
  }
  let added = 0, updated = 0;
  const results = [];
  for (const repo of repos) {
    try {
      const releases = await fetchReleases(repo);
      let a = 0, u = 0;
      for (const rel of releases) {
        const r = upsertRelease(db, repo, rel);
        if (r.inserted) { added++; a++; } else { updated++; u++; }
      }
      results.push({ repo, ok: true, added: a, updated: u, total: releases.length });
    } catch (e) {
      results.push({ repo, ok: false, error: String(e.message || e) });
    }
  }
  return { added, updated, repos: results };
}
