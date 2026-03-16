export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    // Simple health check
    if (request.method === "GET") {
      return new Response("ok", { headers: cors() });
    }

    if (request.method !== "POST") {
      return new Response("Use POST", { status: 405, headers: cors() });
    }

    const payload = await request.json().catch(() => null);
    if (!payload || !payload.filename || !payload.content) {
      return new Response("Missing filename/content", { status: 400, headers: cors() });
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || "main";
    const token = env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return new Response("Missing server secrets", { status: 500, headers: cors() });
    }

    const safeName = String(payload.filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `submissions/${safeName}`;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const body = {
      message: `Upload submission ${safeName}`,
      content: btoa(unescape(encodeURIComponent(payload.content))),
      branch
    };

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "memory-typing-worker",
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(`GitHub upload failed: ${resp.status}\n${t}`, { status: 500, headers: cors() });
    }

    return new Response(JSON.stringify({ ok: true, path }), {
      headers: { ...cors(), "Content-Type": "application/json" }
    });
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}