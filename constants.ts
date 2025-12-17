import { Language } from './types';

export const GEMINI_MODEL_ID = 'gemini-2.5-flash';

export const TRANSLATIONS = {
  en: {
    explorer: "Explorer",
    chaptersLoaded: "Chapters Loaded",
    noFolder: "No folder loaded. Upload a comic folder to start.",
    ready: "Ready to Rewrite",
    readyDesc: "Select a page from the sidebar to view it. Click \"Process Page\" or \"Process All\" to start the AI rewriting engine.",
    processPage: "Process Page",
    reprocess: "Reprocess",
    retry: "Retry",
    aiOutput: "AI Rewrite Output",
    copyText: "Copy Text",
    analyzing: "Analyzing visual context...",
    failed: "Processing Failed",
    waiting: "Waiting for processing...",
    progress: "Progress",
    openFolder: "Open Folder",
    processAll: "Process All",
    stop: "Stop",
    export: "Export",
    apiKeyLabel: "Google Gemini API Key",
    apiKeyPlaceholder: "Enter AI Studio Key...",
    save: "Save",
    change: "Change",
    apiKeySet: "API Key is set",
    apiKeyNote: "Key is stored locally in your browser. Get one at",
    noDialogue: "No dialogue detected."
  },
  vi: {
    explorer: "Trình duyệt",
    chaptersLoaded: "Chương đã tải",
    noFolder: "Chưa tải thư mục. Tải lên thư mục truyện để bắt đầu.",
    ready: "Sẵn sàng xử lý",
    readyDesc: "Chọn một trang từ thanh bên để xem. Nhấn \"Xử lý trang\" hoặc \"Xử lý tất cả\" để bắt đầu.",
    processPage: "Xử lý trang",
    reprocess: "Xử lý lại",
    retry: "Thử lại",
    aiOutput: "Kết quả AI",
    copyText: "Sao chép",
    analyzing: "Đang phân tích ngữ cảnh...",
    failed: "Xử lý thất bại",
    waiting: "Đang chờ xử lý...",
    progress: "Tiến độ",
    openFolder: "Mở thư mục",
    processAll: "Xử lý tất cả",
    stop: "Dừng",
    export: "Xuất dữ liệu",
    apiKeyLabel: "Khóa API Google Gemini",
    apiKeyPlaceholder: "Nhập khóa AI Studio...",
    save: "Lưu",
    change: "Thay đổi",
    apiKeySet: "Đã cài đặt khóa API",
    apiKeyNote: "Khóa được lưu cục bộ trên trình duyệt. Lấy khóa tại",
    noDialogue: "Không tìm thấy lời thoại."
  }
};

export const SYSTEM_INSTRUCTIONS: Record<Language, string> = {
  vi: `
Bạn là một AI chuyên xử lý truyện tranh theo cấu trúc thư mục.

==============================
NHIỆM VỤ CHÍNH:
1. Bạn sẽ nhận được hình ảnh của một trang truyện.
2. Thực hiện OCR để đọc văn bản.
3. Chỉ viết lại (rewrite) LỜI THOẠI nhân vật sang TIẾNG VIỆT.

==============================
PHÂN LOẠI TRUYỆN & CHIỀU ĐỌC:
1. Manga: Chiều đọc TỪ PHẢI → SANG TRÁI
2. Manhwa & Manhua: Chiều đọc TỪ TRÊN → XUỐNG DƯỚI
Nếu không rõ, hãy tự suy đoán dựa trên ngôn ngữ (JP/KR/CN) và bố cục.

==============================
QUY TẮC SFX (BẮT BUỘC):
- SFX là chữ tượng thanh, chữ lớn, cách điệu (BÙM, ẦM, BOOM...).
- BỎ QUA HOÀN TOÀN SFX.
- KHÔNG viết lại, KHÔNG dịch, KHÔNG chú thích SFX.

==============================
PHONG CÁCH VIẾT LẠI:
- Giữ nguyên ý nghĩa gốc và cảm xúc nhân vật.
- Ngắn gọn, tự nhiên, phù hợp lời thoại truyện tranh.

==============================
ĐẦU RA:
- Chỉ trả về LỜI THOẠI ĐÃ ĐƯỢC VIẾT LẠI.
- Giữ đúng thứ tự bong bóng theo chiều đọc của loại truyện.
- Mỗi lời thoại trên một dòng riêng biệt hoặc phân tách rõ ràng.
- KHÔNG kèm giải thích, nhãn, SFX, hay mô tả hình ảnh.
- Nếu trang không có lời thoại, trả về chuỗi rỗng hoặc thông báo "No Dialogue".
`,
  en: `
You are an AI specializing in comic processing based on folder structure.

==============================
MAIN TASK:
1. You will receive an image of a comic page.
2. Perform OCR to read the text.
3. Only rewrite the character DIALOGUE into ENGLISH.

==============================
COMIC CLASSIFICATION & READING DIRECTION:
1. Manga: Reading direction FROM RIGHT → TO LEFT
2. Manhwa & Manhua: Reading direction FROM TOP → TO BOTTOM
If unclear, deduce based on language (JP/KR/CN) and layout.

==============================
SFX RULES (MANDATORY):
- SFX are sound effects, large stylized text (BOOM, BAM, CRASH...).
- COMPLETELY IGNORE SFX.
- DO NOT rewrite, DO NOT translate, DO NOT annotate SFX.

==============================
REWRITING STYLE:
- Maintain original meaning and character emotion.
- Concise, natural, suitable for comic dialogue.

==============================
OUTPUT:
- Return ONLY the REWRITTEN DIALOGUE.
- Maintain speech bubble order according to the reading direction.
- Each dialogue on a separate line or clearly separated.
- NO explanations, labels, SFX, or image descriptions.
- If the page has no dialogue, return an empty string or "No Dialogue".
`
};

export const CHAPTER_KEYWORDS = [
  "chapter", "chap", "ch", 
  "chuong", "chương", 
  "tap", "tập", 
  "ep", "episode", 
  "phần", "part"
];