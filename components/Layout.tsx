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
      {/* Mobile Burger Menu Button */}
      {/* Mobile Sidebar Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowNotifications(false)}></div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-background-dark border-b border-[#dbdfe6] dark:border-gray-800 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNotifications(true)} className="p-2 -ml-2 text-[#616f89] dark:text-gray-400">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <img src="/logo.png" alt="Kairhos Logo" className="h-8 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined text-[#616f89] dark:text-gray-400 text-2xl">notifications</span>
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-background-dark border-r border-[#dbdfe6] dark:border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full lg:flex flex-col justify-between p-4
        ${showNotifications ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
            <div className="px-2">
              <img src="/logo.png" alt="Kairhos Logo" className="h-10 w-auto object-contain lg:h-12" />
            </div>
            <button onClick={() => setShowNotifications(false)} className="lg:hidden p-1 text-[#616f89] dark:text-gray-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
              { path: '/pipeline', icon: 'view_kanban', label: 'Pipeline' },
              { path: '/jobs/new', icon: 'add_circle', label: 'Nova Vaga' },
              { path: '/candidates', icon: 'person_search', label: 'Banco de Talentos' },
              { path: '/reports', icon: 'analytics', label: 'Relatórios' },
              ...(currentUser.role === 'Admin' ? [
                { path: '/users', icon: 'group', label: 'Usuários' },
                { path: '/clients', icon: 'business', label: 'Clientes' }
              ] : [])
            ].map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setShowNotifications(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${link.path === '/jobs/new'
                  ? (location.pathname === '/jobs/new' ? "bg-primary/10 text-primary font-semibold" : "text-[#616f89] hover:bg-gray-100 dark:hover:bg-gray-800 font-medium")
                  : isActive(link.path)
                  }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}

            <div className="my-4 border-t border-[#dbdfe6] dark:border-gray-800"></div>

            <Link to="/settings" onClick={() => setShowNotifications(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/settings')}`}>
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
      <div className="flex-1 flex flex-col relative w-full lg:w-auto h-full overflow-hidden">
        <main className="flex-1 h-full pt-16 lg:pt-0 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
