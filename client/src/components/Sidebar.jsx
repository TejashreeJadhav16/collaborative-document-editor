import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FileText, Users, Upload, LogOut, FileCode, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { to: '/', label: 'My Documents', icon: <FileText className="w-5 h-5" />, end: true },
    { to: '/shared', label: 'Shared With Me', icon: <Users className="w-5 h-5" /> },
    { to: '/upload', label: 'Import File', icon: <Upload className="w-5 h-5" /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-slate-900 border-r border-slate-800 w-64">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 border border-brand-500/30 rounded-xl">
              <FileCode className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-none">CollabDoc</h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">COLLABORATIVE</span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="px-4 py-4 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden md:flex flex-shrink-0 w-64 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <div className="relative z-50 animate-slide-in-right h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
