export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: true, service: "memory-typing-upload-worker" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    try {

      const body = await request.json();
      const filename = body.filename;
      const content = body.content;

      if (!filename || !content) {
        return new Response(JSON.stringify({ error: "Missing filename or content" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      const path = `submissions/${filename}`;
      const encoded = btoa(unescape(encodeURIComponent(content)));

      const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;

      const githubRes = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Add submission ${filename}`,
          content: encoded,
          branch: env.GITHUB_BRANCH
        })
      });

      const data = await githubRes.json();

      if (!githubRes.ok) {
        return new Response(JSON.stringify(data), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
