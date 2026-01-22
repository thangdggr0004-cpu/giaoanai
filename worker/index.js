/* ================== CORS ================== */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/* ================== MODELS ================== */
const MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

/* ================== ENTRY ================== */
export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(req.url);
    if (url.pathname !== "/generate" || req.method !== "POST") {
      return json({ error: "Not found" }, 404);
    }

    return handleGenerate(req, env);
  },
};

/* ================== HANDLER ================== */
async function handleGenerate(req, env) {
  let rawBody;

  try {
    rawBody = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  console.log("PATH:", req.url);
  console.log("RAW BODY:", JSON.stringify(rawBody));

  // 🔥 SDK → REST mapping
  const { contents } = rawBody;

  if (!contents) {
    return json({ error: "Missing contents" }, 400);
  }

  const restPayload = { contents };

  for (const model of MODELS) {
    try {
      console.log("TRY MODEL:", model);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GENAI_API_KEY,
          },
          body: JSON.stringify(restPayload),
        }
      );

      const text = await res.text();
      console.log(`${model} STATUS:`, res.status);
      console.log(`${model} RESPONSE:`, text);

      if (res.ok) {
        return new Response(text, {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      console.error(`MODEL ${model} ERROR:`, err);
    }
  }

  return json({ error: "All models failed" }, 500);
}

/* ================== UTIL ================== */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
