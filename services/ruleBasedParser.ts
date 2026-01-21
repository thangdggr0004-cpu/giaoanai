
// Cấu trúc để lưu kết quả phân tích
export interface ParsedLessonResult {
    title: string;
    periods: string;
    isIntegrated: boolean;
}

// Regex patterns cho văn bản thuần (txt/md)
const lessonPatterns: RegExp[] = [
    // Matches "Tiết 1-2: Bài 1: Title"
    /^Tiết\s+([\d\-\–,]+)[\s:.-]+Bài\s+\d+[\s:.-]+(.+)/i,
    // Matches "Bài 1: Title (2 tiết)" hoặc "Bài 1: Title - 2 tiết"
    /^Bài\s+\d+[\s:.-]+(.+?)(?:\s*[\(\-]\s*(\d+)\s*tiết\s*\)?)?$/i,
    // Matches "Chủ đề 1: Title (4 tiết)"
    /^Chủ đề\s+[\w\d]+[\s:.-]+(.+?)(?:\s*[\(\-]\s*(\d+)\s*tiết\s*\)?)?$/i,
    // Matches "Tiết 1: Title" -> Coi như 1 tiết
    /^Tiết\s+(\d+)[\s:.-]+(.+)/i,
];

/**
 * Parses lesson titles and periods from a text content using predefined rules.
 */
export const parseLessonsWithRules = (textContent: string): ParsedLessonResult[] => {
    const lines = textContent.split('\n');
    const lessons: ParsedLessonResult[] = [];
    const seenUniqueKeys = new Set<string>();

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        for (const pattern of lessonPatterns) {
            const match = trimmedLine.match(pattern);
            if (match) {
                let periods = "";
                let title = "";
                const isIntegrated = trimmedLine.toLowerCase().includes('tích hợp');

                if (pattern.source.includes('Tiết\\s+([\\d\\-\\–,]+)')) {
                    periods = match[1] || "";
                    title = (match[2] || "").trim();
                } else if (pattern.source.includes('tiết')) {
                    title = (match[1] || "").trim();
                    periods = match[2] || "";
                } else {
                    title = (match[2] || match[1] || "").trim();
                }

                if (title) {
                    title = title.replace(/[.,;]$/, '');
                    // Khóa duy nhất kết hợp Tên bài + Tiết để cho phép Bài 1 (Tiết 1) và Bài 1 (Tiết 2)
                    const uniqueKey = `${title}|${periods}`;
                    if (!seenUniqueKeys.has(uniqueKey)) {
                        lessons.push({ title, periods, isIntegrated });
                        seenUniqueKeys.add(uniqueKey);
                        break;
                    }
                }
            }
        }
    }

    return lessons;
};

/**
 * Parses lessons from structured Excel rows
 */
export const parseLessonsFromRows = (rows: any[][]): ParsedLessonResult[] => {
    if (rows.length === 0) return [];

    let headerRowIndex = -1;
    let titleColIndex = -1;
    let periodColIndex = -1;

    // Các từ khóa nhận diện cột Tên bài
    const titleKeywords = ['tên bài', 'nội dung', 'chương', 'bài học', 'tên chủ đề', 'bài dạy'];
    
    // Các từ khóa cho cột THỜI LƯỢNG (Số tiết của bài đó)
    const durationKeywords = ['số tiết', 'thời lượng', 'thời gian', 'số tiết học'];
    // Từ khóa cho cột tiết (Thứ tự tiết: 1, 2, 3...)
    const ordinalKeywords = ['tiết', 'tiết học', 'tiết thứ'];

    // Duyệt tìm header
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const row = rows[i];
        if (!row || !Array.isArray(row)) continue;

        const rowLower = row.map(cell => String(cell || '').toLowerCase().trim());
        
        const tIdx = rowLower.findIndex(cell => titleKeywords.some(kw => cell.includes(kw)));
        
        // Thử tìm cột Thời lượng/Số tiết trước
        let pIdx = rowLower.findIndex(cell => durationKeywords.some(kw => cell.includes(kw)));
        
        // Nếu không thấy, mới tìm cột "Tiết"
        if (pIdx === -1) {
            pIdx = rowLower.findIndex(cell => ordinalKeywords.some(kw => cell === kw || cell.startsWith('tiết')));
        }

        if (tIdx !== -1) {
            headerRowIndex = i;
            titleColIndex = tIdx;
            periodColIndex = pIdx;
            break;
        }
    }

    // Fallback nếu không thấy tiêu đề
    if (titleColIndex === -1) {
        titleColIndex = rows[0] && rows[0].length > 1 ? (rows[0].length > 2 ? 2 : 1) : 0;
    }

    const lessons: ParsedLessonResult[] = [];
    const seenUniqueKeys = new Set<string>();

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[titleColIndex]) continue;

        const rawTitle = String(row[titleColIndex]).trim();
        // Bỏ qua hàng tiêu đề chương hoặc hàng quá ngắn/chỉ chứa số
        if (rawTitle.length < 3 || /^\d+$/.test(rawTitle)) continue;

        const isIntegrated = row.some(cell => String(cell || '').toLowerCase().includes('tích hợp'));

        let periods = '';
        if (periodColIndex !== -1 && row[periodColIndex] !== undefined && row[periodColIndex] !== null) {
            periods = String(row[periodColIndex]).trim();
        }

        if (rawTitle) {
            // Khóa duy nhất kết hợp Tên bài + Tiết để cho phép trùng tên nhưng khác tiết
            const uniqueKey = `${rawTitle}|${periods}`;
            if (!seenUniqueKeys.has(uniqueKey)) {
                lessons.push({ title: rawTitle, periods, isIntegrated });
                seenUniqueKeys.add(uniqueKey);
            }
        }
    }

    return lessons;
};
