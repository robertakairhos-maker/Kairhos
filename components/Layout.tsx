import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const { notifications, markNotificationAsRead, clearNotifications, currentUser } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
      ? "bg-primary/10 text-primary font-semibold"
      : "text-[#616f89] hover:bg-gray-100 dark:hover:bg-gray-800 font-medium";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-[#dbdfe6] dark:border-gray-800 bg-white dark:bg-background-dark h-full flex flex-col justify-between p-4 transition-all duration-300">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="px-2">
              <img src="/logo.png" alt="Kairhos Logo" className="h-12 w-auto object-contain" />
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard')}`}>
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm">Dashboard</span>
            </Link>
            <Link to="/pipeline" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/pipeline')}`}>
              <span className="material-symbols-outlined">view_kanban</span>
              <span className="text-sm">Pipeline</span>
            </Link>
            <Link to="/jobs/new" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/jobs/new' ? "bg-primary/10 text-primary font-semibold" : "text-[#616f89] hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"}`}>
              <span className="material-symbols-outlined">add_circle</span>
              <span className="text-sm">Nova Vaga</span>
            </Link>
            <Link to="/candidates" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/candidates')}`}>
              <span className="material-symbols-outlined">person_search</span>
              <span className="text-sm">Banco de Talentos</span>
            </Link>
            <Link to="/users" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/users')}`}>
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm">Usuários</span>
            </Link>
            <div className="my-4 border-t border-[#dbdfe6] dark:border-gray-800"></div>
            <Link to="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/settings')}`}>
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Configurações</span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#616f89] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">help_center</span>
            <span className="text-sm font-medium">Suporte</span>
          </a>
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors w-full text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <main className="flex-1 overflow-y-auto h-full">
          {children}
        </main>
      </div>
    </div>
  );
};
