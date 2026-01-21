
import React, { useState } from 'react';
import LessonPlanner from './components/LessonPlanner';
import SmasComments from './components/SmasComments';
import AdminPanel from './components/AdminPanel';
import UserGuide from './components/UserGuide';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/Spinner';
import { BookOpenIcon, ChatBubbleBottomCenterTextIcon, UserGroupIcon, ArrowRightOnRectangleIcon, InformationCircleIcon } from './components/Icons';

type Tab = 'guide' | 'planner' | 'smas' | 'admin';

const App: React.FC = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('guide');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={signInWithGoogle} />;
  }

  if (!user.isActive) {
    return <PendingActivationScreen userDisplayName={user.displayName} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 shrink-0">
              Trợ Lý Giáo Viên AI
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
              <nav className="flex space-x-1 sm:space-x-2 bg-gray-200 p-1 rounded-lg shrink-0">
                <TabButton
                  label="Hướng dẫn"
                  icon={<InformationCircleIcon className="w-5 h-5" />}
                  isActive={activeTab === 'guide'}
                  onClick={() => setActiveTab('guide')}
                />
                <TabButton
                  label="Soạn Giáo Án"
                  icon={<BookOpenIcon />}
                  isActive={activeTab === 'planner'}
                  onClick={() => setActiveTab('planner')}
                />
                <TabButton
                  label="Nhận xét SMAS"
                  icon={<ChatBubbleBottomCenterTextIcon />}
                  isActive={activeTab === 'smas'}
                  onClick={() => setActiveTab('smas')}
                />
                {user.isAdmin && (
                  <TabButton
                    label="Quản trị"
                    icon={<UserGroupIcon />}
                    isActive={activeTab === 'admin'}
                    onClick={() => setActiveTab('admin')}
                  />
                )}
              </nav>
              <button
                onClick={signOut}
                title="Đăng xuất"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors shrink-0"
              >
                <ArrowRightOnRectangleIcon />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        {activeTab === 'guide' && <UserGuide />}
        {activeTab === 'planner' && <LessonPlanner />}
        {activeTab === 'smas' && <SmasComments />}
        {activeTab === 'admin' && user.isAdmin && <AdminPanel />}
      </main>
       <footer className="text-center p-4 text-xs text-gray-500 bg-white border-t">
        Phát triển bởi ThắngDG | Vui lòng không lạm dụng công cụ.
      </footer>
    </div>
  );
};

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-sm">
      <h1 className="text-2xl font-bold text-indigo-600 mb-2">Trợ Lý Giáo Viên AI</h1>
      <p className="text-gray-600 mb-6">Vui lòng đăng nhập để tiếp tục</p>
      <button
        onClick={onLogin}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
        <span className="text-gray-700 font-medium">Đăng nhập với Google</span>
      </button>
    </div>
  </div>
);

const PendingActivationScreen: React.FC<{ userDisplayName: string | null }> = ({ userDisplayName }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-md">
      <h1 className="text-2xl font-bold text-indigo-600 mb-2">Xin chào, {userDisplayName || 'bạn'}!</h1>
      <p className="text-gray-700">Tài khoản của bạn đã được ghi nhận.</p>
      <p className="text-gray-600 mt-4">Vui lòng chờ quản trị viên kích hoạt để có thể sử dụng các tính năng của ứng dụng. Xin cảm ơn!</p>
    </div>
  </div>
);


interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 shrink-0 ${
      isActive
        ? 'bg-white text-indigo-600 shadow-sm'
        : 'text-gray-600 hover:bg-gray-300'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
