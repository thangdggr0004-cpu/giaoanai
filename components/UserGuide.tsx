
import React from 'react';
import { 
  BookOpenIcon, 
  ChatBubbleBottomCenterTextIcon, 
  SparklesIcon, 
  DocumentTextIcon, 
  InformationCircleIcon, 
  FacebookIcon, 
  PhoneIcon, 
  BankIcon, 
  HeartIcon 
} from './Icons';

const UserGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Author Header - Super Compact Version */}
      <div className="bg-white rounded-xl p-2 sm:p-3 border border-indigo-50 shadow-sm overflow-hidden relative">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Brand & Socials */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter leading-none">Tác giả</span>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">ThắngĐG</h2>
            </div>
            <div className="h-6 w-px bg-gray-100 mx-1 hidden sm:block"></div>
            <div className="flex gap-1.5">
              <a 
                href="https://www.facebook.com/share/183WAksSd9/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a 
                href="tel:0787567870" 
                className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
              >
                <PhoneIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Bank & Donate */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                <BankIcon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-mono font-bold text-gray-600">Techcom: 38.667788.9999</span>
             </div>
             <a 
                href="https://me.momo.vn/donateThangDG" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-pink-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md hover:bg-pink-700 transition-colors shadow-sm shrink-0"
              >
                <HeartIcon className="w-3 h-3 fill-current" />
                <span>Ủng hộ</span>
              </a>
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
          Trợ Lý Giáo Viên AI
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">
          Sử dụng trí tuệ nhân tạo để tối ưu hóa công việc giảng dạy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feature 1: Lesson Planner */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="bg-indigo-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <BookOpenIcon className="text-indigo-600 w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Soạn Giáo Án Thông Minh</h2>
          <ul className="space-y-2 text-sm text-gray-600 flex-grow">
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600">1.</span>
              <span>Chọn <strong>Bộ sách</strong> và <strong>Công văn</strong> hướng dẫn.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600">2.</span>
              <span>Tải lên <strong>Kế hoạch giảng dạy</strong> (Excel/Text).</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600">3.</span>
              <span>Nhấn <strong>Phân tích</strong> để lấy danh sách bài học.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-indigo-600">4.</span>
              <span>Chọn bài và nhấn <strong>Soạn giáo án</strong>.</span>
            </li>
          </ul>
        </div>

        {/* Feature 2: SMAS Comments */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="bg-green-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <ChatBubbleBottomCenterTextIcon className="text-green-600 w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Nhận xét SMAS Hàng Loạt</h2>
          <ul className="space-y-2 text-sm text-gray-600 flex-grow">
            <li className="flex gap-2">
              <span className="font-bold text-green-600">1.</span>
              <span>Tải file Excel bảng điểm xuất từ hệ thống SMAS.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600">2.</span>
              <span>Nhấn <strong>Đọc dữ liệu</strong> để chuẩn bị danh sách.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600">3.</span>
              <span>Hệ thống tự động đề xuất nhận xét theo điểm số.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600">4.</span>
              <span><strong>Xuất file Excel</strong> đã có đầy đủ nhận xét.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Advanced Tips */}
      <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="w-5 h-5 text-yellow-300" />
          <h2 className="text-lg font-bold">Mẹo nhỏ cho bạn</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-indigo-100">
          <div className="bg-white/10 p-3 rounded-xl">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2 text-xs">
              <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" /> Góp ý & Yêu cầu
            </h3>
            <p className="text-[11px] leading-relaxed">
              Nếu bạn cần mẫu giáo án riêng hoặc có ý tưởng mới, hãy liên hệ trực tiếp với tác giả để được hỗ trợ nâng cấp.
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2 text-xs">
              <InformationCircleIcon className="w-3.5 h-3.5" /> Kiểm tra lại
            </h3>
            <p className="text-[11px] leading-relaxed">
              AI có thể sai sót, hãy xem lại kết quả trước khi sử dụng chính thức.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-gray-800">Câu hỏi thường gặp</h2>
        <div className="space-y-2">
          <details className="group bg-white rounded-xl p-3 border border-gray-200 cursor-pointer transition-all">
            <summary className="font-medium list-none flex justify-between items-center text-xs">
              <span>Hệ thống hỗ trợ những định dạng file nào?</span>
              <span className="group-open:rotate-180 transition-transform text-[10px]">▼</span>
            </summary>
            <p className="mt-2 text-gray-500 text-[11px]">Hỗ trợ Excel (.xlsx, .xls) và Text (.txt, .md). File Excel cần có cột tiêu đề tương ứng (Tên bài hoặc Họ tên/Điểm).</p>
          </details>
          <details className="group bg-white rounded-xl p-3 border border-gray-200 cursor-pointer transition-all">
            <summary className="font-medium list-none flex justify-between items-center text-xs">
              <span>Tôi có cần mạng để sử dụng không?</span>
              <span className="group-open:rotate-180 transition-transform text-[10px]">▼</span>
            </summary>
            <p className="mt-2 text-gray-500 text-[11px]">Có, ứng dụng sử dụng Gemini AI của Google nên yêu cầu kết nối internet ổn định.</p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
