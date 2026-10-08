export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#0b0d10;color:#e6e8ec;font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:inherit;text-decoration:none}
header{border-bottom:1px solid #232830}
.wrap{max-width:960px;margin:0 auto;padding:0 16px}
nav{display:flex;align-items:center;justify-content:space-between;padding:16px 0}
.brand{font-weight:700;letter-spacing:-.02em}
.brand span{color:#7c5cff}
nav .links{display:flex;gap:18px;font-size:14px;color:#b6bcc7}
nav .links a:hover{color:#fff}
main{max-width:960px;margin:0 auto;padding:32px 16px}
footer{max-width:960px;margin:0 auto;padding:32px 16px 48px;font-size:12px;color:#6b7280}
h1{font-size:28px;font-weight:650;letter-spacing:-.02em;margin:0 0 6px}
h2{font-size:15px;font-weight:600;margin:0 0 14px}
.muted{color:#8b93a1;font-size:14px;font-weight:400}
.grid{display:grid;gap:16px;grid-template-columns:1fr}
@media(min-width:640px){.grid{grid-template-columns:1fr 1fr}}
.card{border:1px solid #232830;background:#14171c;border-radius:12px;padding:18px}
a.card{display:block;transition:border-color .15s}
a.card:hover{border-color:#7c5cff}
.row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.chip{font-size:10px;text-transform:uppercase;letter-spacing:.08em;border:1px solid #232830;border-radius:6px;padding:3px 8px;color:#8b93a1;white-space:nowrap}
.tag{font-size:11px;border-radius:999px;background:#232830;color:#c3c9d4;padding:2px 9px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
pre{white-space:pre-wrap;font-family:inherit;margin:0}
.field{display:flex;justify-content:space-between;gap:16px;font-size:14px;padding:7px 0;border-bottom:1px solid #1c2027}
.field:last-child{border-bottom:0}
.field span:first-child{color:#8b93a1}
input,textarea{width:100%;background:#14171c;border:1px solid #232830;border-radius:9px;color:#e6e8ec;padding:9px 11px;font:inherit;font-size:14px;outline:none}
input:focus,textarea:focus{border-color:#7c5cff}
textarea{min-height:130px;resize:vertical;font-family:ui-monospace,monospace;font-size:13px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#14171c;border:1px solid #232830;color:#e6e8ec;border-radius:9px;padding:9px 14px;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:border-color .15s}
.btn:hover{border-color:#7c5cff}
.btn-primary{background:#7c5cff;border:1px solid #7c5cff;color:#fff;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:9px 14px;font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.btn-primary:hover{opacity:.9}
.btn-primary[disabled],.btn[disabled]{opacity:.5;cursor:default}
.btn-danger{background:transparent;border:1px solid rgba(239,68,68,.4);color:#f87171;border-radius:9px;padding:9px 14px;font:inherit;font-size:14px;cursor:pointer}
.btn-danger:hover{background:rgba(239,68,68,.1)}
.form-grid{display:grid;gap:12px}
@media(min-width:640px){.form-grid{grid-template-columns:1fr 1fr}.col-2{grid-column:span 2}}
table{width:100%;border-collapse:collapse}
td{padding:14px 0;border-bottom:1px solid #232830;vertical-align:middle}
td:last-child{text-align:right;white-space:nowrap}
td .acts{display:inline-flex;gap:8px}
.center{max-width:380px;margin:0 auto}
.empty{color:#8b93a1}
.src{font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-radius:5px;padding:2px 6px;margin-left:6px}
.src-gh{background:#1a2332;color:#7ca9ff}
.src-manual{background:#232830;color:#8b93a1}
.syncbox{border:1px solid #232830;background:#14171c;border-radius:12px;padding:16px;margin-bottom:24px}
.syncbox .repos{font-size:13px;color:#8b93a1;margin-top:6px;line-height:1.6}
.syncbox code{background:#0b0d10;padding:1px 6px;border-radius:4px;font-size:12px}
.sync-out{margin-top:12px;font-size:13px;color:#c3c9d4}
`;

export function layout(title, body) {
  return '<!doctype html>\n<html lang="en">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<meta name="author" content="Abi Manyu (BlueBarry)">\n' +
    '<title>' + esc(title) + ' — Release Hub</title>\n' +
    '<style>' + CSS + '</style>\n' +
    '</head>\n<body>\n' +
    '<header><div class="wrap"><nav>' +
    '<a class="brand" href="/">Release<span>Hub</span></a>' +
    '<div class="links"><a href="/">Catalog</a><a href="/admin">Admin</a></div>' +
    '</nav></div></header>\n' +
    '<main>' + body + '</main>\n' +
    '<footer>Made by Abi Manyu (BlueBarry) · © ' + new Date().getFullYear() + ' Abi Manyu. All rights reserved.</footer>\n' +
    '</body>\n</html>';
}

function card(r) {
  const tags = String(r.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const cl = String(r.changelog || '');
  return '<a class="card" href="/release/' + esc(r.slug) + '">' +
    '<div class="row">' +
      '<div><div style="font-weight:600">' + esc(r.name) + '</div>' +
      '<div class="muted" style="font-size:12px;margin-top:2px">v' + esc(r.version) + ' · ' + esc(r.repo) + '</div></div>' +
      '<span class="chip">' + (String(r.abi).includes('+') ? 'universal' : esc(r.abi)) + '</span>' +
    '</div>' +
    (cl ? '<p style="font-size:14px;color:#c3c9d4;margin:12px 0 0;white-space:pre-wrap">' + esc(cl.slice(0, 220)) + (cl.length > 220 ? '…' : '') + '</p>' : '') +
    (tags.length ? '<div class="tags">' + tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' : '') +
    '<div class="muted" style="font-size:12px;margin-top:12px">Published ' + new Date(r.published_at).toLocaleDateString() + '</div>' +
    '</a>';
}

export function pageCatalog(rows) {
  const body = rows.length === 0
    ? '<div class="card empty">No releases yet. Add one from <a href="/admin" style="color:#7c5cff">/admin</a>.</div>'
    : '<div class="grid">' + rows.map(card).join('') + '</div>';
  return layout('Releases',
    '<h1>Releases</h1>' +
    '<p class="muted" style="margin:0 0 28px">APKs by Abi Manyu (BlueBarry). All builds universal — armeabi-v7a + arm64-v8a + x86_64.</p>' +
    body);
}

export function pageRelease(r) {
  const tags = String(r.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  return layout(r.name,
    '<h1>' + esc(r.name) + '</h1>' +
    '<p class="muted" style="margin:0 0 24px">v' + esc(r.version) + ' · ' + esc(r.repo) + '</p>' +
    '<div class="card">' +
      '<div class="field"><span>ABI</span><span>' + esc(r.abi) + '</span></div>' +
      '<div class="field"><span>Published</span><span>' + new Date(r.published_at).toLocaleString() + '</span></div>' +
      '<div class="field"><span>Source</span><span>' + (r.source === 'github' ? 'GitHub Release' : 'Manual') + '</span></div>' +
      '<div class="field"><span>Author</span><span>Abi Manyu (BlueBarry)</span></div>' +
    '</div>' +
    (r.changelog ? '<h2 style="margin:28px 0 12px">Changelog</h2><div class="card"><pre>' + esc(r.changelog) + '</pre></div>' : '') +
    (tags.length ? '<div class="tags">' + tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' : '') +
    '<div style="margin-top:24px"><a class="btn-primary" href="' + esc(r.download_url) + '" rel="noopener">Download APK</a></div>' +
    '<p class="muted" style="font-size:12px;margin-top:14px">ABI: ' + esc(r.abi) + ' (universal). Older v7a devices and modern arm64 devices install the correct slice automatically.</p>');
}

export function pageLogin() {
  return layout('Admin',
    '<div class="center">' +
      '<h1 style="margin-bottom:18px">Admin login</h1>' +
      '<form class="card" id="lf">' +
        '<input type="password" name="password" placeholder="Admin password" autofocus autocomplete="current-password">' +
        '<div style="margin-top:14px"><button class="btn-primary" style="width:100%" type="submit">Login</button></div>' +
      '</form>' +
    '</div>' +
    '<script>' +
    'document.getElementById("lf").addEventListener("submit", async function(e){' +
      'e.preventDefault();' +
      'var pw = this.querySelector("[name=password]").value;' +
      'var res = await fetch("/api/login", {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({password: pw})});' +
      'if (res.ok) { location.reload(); } else { alert("Wrong password"); }' +
    '});' +
    '</script>');
}

export function pageAdmin(rows, repos, hasToken) {
  const repoList = repos || [];
  const srcBadge = r => '<span class="src ' + (r.source === 'github' ? 'src-gh' : 'src-manual') + '">' +
    (r.source === 'github' ? 'gh' : 'manual') + '</span>';

  const list = rows.map(r =>
    '<tr data-id="' + r.id + '" data-json="' + esc(JSON.stringify(r)) + '">' +
      '<td>' +
        '<div style="font-weight:500">' + esc(r.name) + ' <span class="muted">v' + esc(r.version) + '</span>' + srcBadge(r) + '</div>' +
        '<div class="muted" style="font-size:12px">' + esc(r.repo) + ' · ' + new Date(r.published_at).toLocaleDateString() + '</div>' +
      '</td>' +
      '<td><span class="acts">' +
        '<a class="btn" href="/release/' + esc(r.slug) + '" target="_blank" rel="noopener">View</a>' +
        '<button class="btn" data-act="edit" type="button">Edit</button>' +
        '<button class="btn-danger" data-act="del" type="button">Delete</button>' +
      '</span></td>' +
    '</tr>').join('');

  const syncBox =
    '<div class="syncbox">' +
      '<div class="row">' +
        '<div>' +
          '<h2 style="margin:0">GitHub sync</h2>' +
          '<div class="repos">' +
            (repoList.length
              ? 'Tracked: ' + repoList.map(r => '<code>' + esc(r) + '</code>').join(' ') +
                '<br>Token: ' + (hasToken ? 'set' : '<span style="color:#f87171">not set (60 req/hour limit)</span>')
              : '<span style="color:#f87171">GITHUB_REPOS is empty — set it in .env and restart.</span>') +
          '</div>' +
        '</div>' +
        '<button class="btn-primary" id="sync" type="button"' + (repoList.length ? '' : ' disabled') + '>Sync now</button>' +
      '</div>' +
      '<div class="sync-out" id="sync-out"></div>' +
    '</div>';

  const adminScript = [
    '(function(){',
    'var form=document.getElementById("form");',
    'var title=document.getElementById("form-title");',
    'var submit=document.getElementById("submit");',
    'var cancel=document.getElementById("cancel");',
    'var idField=form.querySelector("[name=id]");',
    'var FIELDS=["name","version","changelog","abi","download_url","repo","tags","published_at"];',

    'function fill(r){',
      'idField.value=r.id||"";',
      'FIELDS.forEach(function(k){',
        'var el=form.querySelector("[name="+k+"]");',
        'if(!el)return;',
        'var v=r[k]==null?"":String(r[k]);',
        'if(k==="published_at")v=v.slice(0,10);',
        'el.value=v;',
      '});',
      'title.textContent=r.id?"Edit release":"New release (manual)";',
      'submit.textContent=r.id?"Update":"Create";',
      'cancel.hidden=!r.id;',
      'window.scrollTo({top:0,behavior:"smooth"});',
    '}',

    'form.addEventListener("submit", async function(e){',
      'e.preventDefault();',
      'var data={};',
      'FIELDS.forEach(function(k){',
        'var el=form.querySelector("[name="+k+"]");',
        'if(el)data[k]=el.value;',
      '});',
      'var id=idField.value;',
      'var url=id?"/api/releases/"+id:"/api/releases";',
      'var method=id?"PATCH":"POST";',
      'var res=await fetch(url,{method:method,headers:{"content-type":"application/json"},body:JSON.stringify(data)});',
      'if(!res.ok){',
        'var j={};',
        'try{j=await res.json();}catch(_){}',
        'alert(j.error||"Save failed");',
        'return;',
      '}',
      'location.reload();',
    '});',

    'cancel.addEventListener("click",function(){location.reload();});',

    'var listEl=document.getElementById("list");',
    'if(listEl){',
      'listEl.addEventListener("click", async function(e){',
        'var btn=e.target.closest("button[data-act]");',
        'if(!btn)return;',
        'var tr=btn.closest("tr");',
        'var id=tr.getAttribute("data-id");',
        'if(btn.getAttribute("data-act")==="edit"){',
          'fill(JSON.parse(tr.getAttribute("data-json")));',
        '}else{',
          'if(!confirm("Delete this release?"))return;',
          'var res=await fetch("/api/releases/"+id,{method:"DELETE"});',
          'if(res.ok)location.reload();',
        '}',
      '});',
    '}',

    'document.getElementById("logout").addEventListener("click", async function(){',
      'await fetch("/api/logout",{method:"POST"});',
      'location.reload();',
    '});',

    'var syncBtn=document.getElementById("sync");',
    'var syncOut=document.getElementById("sync-out");',
    'if(syncBtn){',
      'syncBtn.addEventListener("click", async function(){',
        'syncBtn.disabled=true;',
        'syncOut.textContent="Syncing…";',
        'var t0=Date.now();',
        'var res=await fetch("/api/sync",{method:"POST"});',
        'var j={};',
        'try{j=await res.json();}catch(_){}',
        'if(!res.ok){',
          'syncOut.textContent="Error: "+(j.error||res.status);',
          'syncBtn.disabled=false;',
          'return;',
        '}',
        'var el=document.createElement("div");',
        'var head=document.createElement("div");',
        'head.textContent="Added "+j.added+", updated "+j.updated;',
        'el.appendChild(head);',
        '(j.repos||[]).forEach(function(r){',
          'var line=document.createElement("div");',
          'line.textContent=(r.ok?"OK ":"ERR ")+r.repo+(r.ok?" ("+r.total+" releases)":" - "+r.error);',
          'el.appendChild(line);',
        '});',
        'var timing=document.createElement("div");',
        'timing.className="muted";',
        'timing.style.fontSize="12px";',
        'timing.style.marginTop="6px";',
        'timing.textContent="in "+((Date.now()-t0)/1000).toFixed(1)+"s";',
        'el.appendChild(timing);',
        'syncOut.innerHTML="";',
        'syncOut.appendChild(el);',
        'setTimeout(function(){location.reload();}, 1200);',
      '});',
    '}',
    '})();'
  ].join('');

  return layout('Admin',
    '<div class="row" style="margin-bottom:20px">' +
      '<h1>Releases <span class="muted">(' + rows.length + ')</span></h1>' +
      '<button class="btn" id="logout" type="button">Log out</button>' +
    '</div>' +

    syncBox +

    '<form class="card" id="form" style="margin-bottom:28px">' +
      '<h2 id="form-title">New release (manual)</h2>' +
      '<input type="hidden" name="id" value="">' +
      '<div class="form-grid">' +
        '<input name="name" placeholder="App name" required>' +
        '<input name="version" placeholder="Version (1.0.0)" required>' +
        '<input class="col-2" name="download_url" placeholder="Download URL (GitHub Release asset)" required>' +
        '<input name="repo" placeholder="Repo (abim70750-commits/xyz)" value="abim70750-commits/" required>' +
        '<input name="tags" placeholder="Tags (android, utility)">' +
        '<input class="col-2" name="abi" value="armeabi-v7a + arm64-v8a + x86_64">' +
        '<input name="published_at" type="date" value="' + new Date().toISOString().slice(0, 10) + '">' +
      '</div>' +
      '<div style="margin-top:12px"><textarea name="changelog" placeholder="Changelog"></textarea></div>' +
      '<div style="display:flex;gap:8px;margin-top:14px">' +
        '<button class="btn-primary" type="submit" id="submit">Create</button>' +
        '<button class="btn" type="button" id="cancel" hidden>Cancel</button>' +
      '</div>' +
    '</form>' +

    (rows.length
      ? '<table><tbody id="list">' + list + '</tbody></table>'
      : '<div class="card empty">No releases yet.</div>') +

    '<script>' + adminScript + '</script>');
}

export function page404() {
  return layout('Not found',
    '<h1>404</h1><p class="muted" style="margin-top:8px">That release does not exist.</p>' +
    '<div style="margin-top:20px"><a class="btn" href="/">Back to catalog</a></div>');
}
