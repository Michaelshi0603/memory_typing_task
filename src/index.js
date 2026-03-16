export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    if (request.method === "GET") {
      return json({ ok: true, service: "memory-typing-upload-worker" }, 200);
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Use POST" }, 405);
    }

    const payload = await request.json().catch(() => null);
    if (!payload || !payload.filename || !payload.content) {
      return json({ ok: false, error: "Missing filename/content" }, 400);
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || "main";
    const token = env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return json({ ok: false, error: "Missing server secrets" }, 500);
    }

    const safeName = String(payload.filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `submissions/${safeName}`;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const body = {
      message: `Upload submission ${safeName}`,
      content: toBase64Utf8(String(payload.content)),
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

    const responseText = await resp.text();

    if (!resp.ok) {
      return json({
        ok: false,
        error: `GitHub upload failed (${resp.status})`,
        details: responseText
      }, 500);
    }

    return json({ ok: true, path }, 200);
  }
};

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors(),
      "Content-Type": "application/json"
    }
  });
}
