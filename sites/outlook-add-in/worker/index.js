export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/access-count' || url.pathname === '/fast-signature/api/access-count') {
      const headers = {'Cache-Control':'no-store', 'Content-Type':'application/json; charset=utf-8'};
      if (request.method !== 'POST') return new Response('', {status:405, headers:{...headers, Allow:'POST'}});
      if ((request.headers.get('origin') && request.headers.get('origin') !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') return new Response('', {status:403, headers});
      try {
        const row = await env.DB.prepare('INSERT INTO site_access_counter (id, count) VALUES (?, 100) ON CONFLICT(id) DO UPDATE SET count = count + 1 RETURNING count').bind(url.pathname.startsWith('/fast-signature/') ? 2 : 1).first();
        return new Response(JSON.stringify({count:row.count}), {headers});
      } catch {
        return new Response('{}', {status:503, headers});
      }
    }
    if (!['GET','HEAD'].includes(request.method)) return new Response('', {status:405});
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('', {status:400}); }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const asset = ASSETS[pathname];
    if (!asset) return new Response('Not found', {status:404});
    const bytes = Uint8Array.from(atob(asset.data), c=>c.charCodeAt(0));
    return new Response(request.method==='HEAD'?null:bytes, {headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
  }
};
