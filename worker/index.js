// worker/index.js

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    // 1. Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const url = new URL(request.url);

      const target =
        "https://generativelanguage.googleapis.com" +
        url.pathname +
        url.search;

      const headers = new Headers();
      headers.set("x-goog-api-key", env.GENAI_API_KEY);
      headers.set("content-type", "application/json");

      const body =
        request.method === "GET" || request.method === "HEAD"
          ? null
          : request.body;

      const resp = await fetch(target, {
        method: request.method,
        headers,
        body,
      });

      // 2. Clone response headers + inject CORS
      const responseHeaders = new Headers(resp.headers);
      Object.entries(corsHeaders).forEach(([k, v]) =>
        responseHeaders.set(k, v)
      );

      return new Response(resp.body, {
        status: resp.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  },
};
