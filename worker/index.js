// worker/index.js
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      const target =
        'https://generativelanguage.googleapis.com' +
        url.pathname +
        url.search;

      const headers = new Headers(request.headers);
      headers.delete('authorization');
      headers.set('x-goog-api-key', env.GENAI_API_KEY);
      headers.set('content-type', 'application/json');

      const body =
        request.method === 'GET' ? null : request.body;

      const resp = await fetch(target, {
        method: request.method,
        headers,
        body,
      });

      return new Response(resp.body, {
        status: resp.status,
        headers: resp.headers,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500 }
      );
    }
  },
};
