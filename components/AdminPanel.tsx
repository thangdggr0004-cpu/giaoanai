import React from 'react';

const AdminPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg h-full flex flex-col gap-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý hệ thống</h2>
      <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002-2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Chế độ Local / TWA</h3>
        <p className="mt-1 text-sm text-gray-500">
          Ứng dụng hiện đang chạy mà không cần Firebase. Tính năng quản lý người dùng tập trung đã được vô hiệu hóa.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;