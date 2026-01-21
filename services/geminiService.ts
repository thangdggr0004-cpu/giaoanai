// services/geminiService.ts
// FRONTEND SAFE VERSION
// ❌ Không dùng @google/genai
// ❌ Không chứa API KEY
// ✅ Gọi Cloudflare Worker proxy

/* ================= TYPES ================= */

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiRequestPayload {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

/* ================= CORE CALL ================= */

const MODEL = 'gemini-3-flash-preview';

async function callGemini(
  payload: GeminiRequestPayload,
  responseAsJson = false
): Promise<string> {
  const baseUrl = import.meta.env.VITE_GENAI_PROXY_URL;

  if (!baseUrl) {
    throw new Error(
      'Thiếu VITE_GENAI_PROXY_URL trong .env.local (Cloudflare Worker URL)'
    );
  }

  const res = await fetch(
    `${baseUrl}/v1beta2/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini proxy error ${res.status}: ${err}`);
  }

  const data = await res.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) return '';

  if (responseAsJson) {
    return text.trim();
  }

  return text;
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
Nhiệm vụ của bạn là trích xuất TOÀN BỘ danh sách các bài học/chủ đề và số tiết tương ứng.

YÊU CẦU BẮT BUỘC:
1. Trích xuất chính xác tên bài học.
2. Trích xuất thông tin tiết ("2 tiết", "Tiết 1", "Tiết 1-3"...).
3. Nếu cùng bài nhưng khác tiết → lấy TẤT CẢ.
4. Xác định bài học có phải là tích hợp hay không.
5. TRẢ VỀ JSON ARRAY, KHÔNG markdown, KHÔNG giải thích.

FORMAT JSON:
[
  {
    "title": "string",
    "periods": "string",
    "isIntegrated": boolean
  }
]

NỘI DUNG FILE:
---
${textContent}
---
`;

  try {
    const raw = await callGemini(
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 2048,
        },
      },
      true
    );

    return JSON.parse(raw);
  } catch (error) {
    console.error('Error parsing lessons with Gemini:', error);
    throw new Error(
      'Không thể phân tích danh sách bài học từ file. Vui lòng kiểm tra lại nội dung.'
    );
  }
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

Dưới đây là thông tin cụ thể của bài học cần soạn:
- Tên bài: "${lessonTitle}"
- Số tiết: "${periods}"
- Bộ sách: "${bookSeries}"
- Môn học: "${subject}"
- Lớp: "${grade}"

HƯỚNG DẪN:
1. Nếu có "Tiết X" → chỉ soạn đúng tiết đó.
2. Nếu là nhiều tiết → chia rõ từng tiết.
3. Nội dung chi tiết, bám sát SGK "${bookSeries}".
`;

  try {
    return await callGemini({
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });
  } catch (error) {
    console.error(
      `Error generating lesson plan for "${lessonTitle}":`,
      error
    );
    return `Đã xảy ra lỗi khi tạo giáo án cho bài: "${lessonTitle}".`;
  }
};

/* ================= SMAS COMMENTS ================= */

export const generateSmasComment = async (
  role: 'GVCN' | 'GVBM',
  studentName: string,
  performance: string,
  keywords: string[]
): Promise<string[]> => {
  const roleDescription =
    role === 'GVCN'
      ? 'Bạn là giáo viên chủ nhiệm, nhận xét tổng hợp.'
      : 'Bạn là giáo viên bộ môn, nhận xét kiến thức và kỹ năng.';

  const prompt = `
${roleDescription}

Viết 3 lời nhận xét học bạ cho học sinh ${studentName},
theo Thông tư 22/2021 và 26/2020.

Mức đánh giá: "${performance}".
${keywords.length ? `Từ khóa: ${keywords.join(', ')}` : ''}

YÊU CẦU:
- Văn phong chuẩn giáo dục.
- Không đánh số.
- Mỗi nhận xét ngăn cách bằng "---".
`;

  try {
    const text = await callGemini({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    });

    return text
      .split('---')
      .map((c) => c.trim())
      .filter(Boolean);
  } catch (error) {
    console.error('Error generating SMAS comment:', error);
    throw new Error('Không thể tạo nhận xét. Vui lòng thử lại.');
  }
};
