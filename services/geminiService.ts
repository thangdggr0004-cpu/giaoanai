// services/geminiService.ts
// FRONTEND SAFE VERSION
// ❌ Không dùng @google/genai
// ❌ Không chứa API KEY
// ✅ Gọi Cloudflare Worker proxy (/generate)

/* ================= TYPES ================= */

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

/* ================= CORE CALL ================= */

async function callGemini(
  payload: any,
  responseAsJson = false
): Promise<string> {
  const baseUrl = import.meta.env.VITE_GENAI_PROXY_URL;

  if (!baseUrl) {
    throw new Error(
      'Thiếu VITE_GENAI_PROXY_URL (Cloudflare Worker URL)'
    );
  }

  const res = await fetch(`${baseUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini proxy error ${res.status}: ${err}`);
  }

  const data: GeminiResponse = await res.json();

  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts;

  if (!parts || parts.length === 0) {
    console.error('Gemini empty response:', data);
    return '';
  }

  const text = parts
    .map(p => p.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  return responseAsJson ? text : text;
}

/* ================= PARSE LESSONS ================= */

export const parseLessonsFromText = async (
  textContent: string,
  subject: string,
  grade: string
): Promise<
  { title: string; periods: string; isIntegrated: boolean }[]
> => {
  const prompt = `
Dưới đây là nội dung một file kế hoạch giảng dạy cho môn ${subject} ${grade} của Việt Nam.

YÊU CẦU:
- Trích xuất TOÀN BỘ bài học
- Có số tiết
- Có isIntegrated
- TRẢ VỀ JSON ARRAY THUẦN (KHÔNG markdown)
`;

  const raw = await callGemini(
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${prompt}\n---\n${textContent}\n---` }],
        },
      ],
    },
    true
  );

  return JSON.parse(raw);
};

/* ================= GENERATE LESSON PLAN ================= */

export const generateLessonPlan = async (
  lessonTitle: string,
  periods: string,
  basePrompt: string,
  bookSeries: string,
  subject: string,
  grade: string
): Promise<string> => {
  const fullPrompt = `
${basePrompt}

THÔNG TIN BÀI:
- Tên bài: "${lessonTitle}"
- Số tiết: "${periods}"
- Bộ sách: "${bookSeries}"
- Môn: "${subject}"
- Lớp: "${grade}"
`;

  return callGemini({
    contents: [
      {
        role: 'user',
        parts: [{ text: fullPrompt }],
      },
    ],
  });
};

/* ================= SMAS COMMENTS ================= */

export const generateSmasComment = async (
  role: 'GVCN' | 'GVBM',
  studentName: string,
  performance: string,
  keywords: string[]
): Promise<string[]> => {
  const prompt = `
${role === 'GVCN' ? 'Bạn là giáo viên chủ nhiệm.' : 'Bạn là giáo viên bộ môn.'}

Viết 3 nhận xét học bạ cho học sinh ${studentName}.
Mức đánh giá: ${performance}
${keywords.length ? `Từ khóa: ${keywords.join(', ')}` : ''}

Ngăn cách mỗi nhận xét bằng ---
`;

  const text = await callGemini({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  return text.split('---').map(t => t.trim()).filter(Boolean);
};
