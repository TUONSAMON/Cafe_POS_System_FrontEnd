import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Map, 
  Package, 
  BarChart3, 
  Users, 
  Sun, 
  Moon, 
  Languages,
  LogOut
} from "lucide-react";

export default function Layout({ children }) {
  const { lang, switchLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" } },
    { path: "/pos", icon: ShoppingCart, label: { en: "POS", km: "ការលក់" } },
    { path: "/tables", icon: Map, label: { en: "Tables", km: "ប្លង់តុ" } },
    { path: "/inventory", icon: Package, label: { en: "Inventory", km: "ស្តុកទំនិញ" } },
    { path: "/staff", icon: Users, label: { en: "Staff", km: "បុគ្គលិក" } },
    { path: "/reports", icon: BarChart3, label: { en: "Reports", km: "របាយការណ៍" } },
  ];

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 ${lang === 'km' ? 'font-khmer' : ''}`}>
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 flex-shrink-0">
            <ShoppingCart size={22} strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl dark:text-white hidden lg:block tracking-tighter uppercase">Nexus POS</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 p-3 rounded-xl transition-all group
                ${isActive 
                  ? 'active bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
              `}
            >
              {/* FIXED: Using static string classes to prevent .trim() errors */}
              <item.icon 
                size={22} 
                className="transition-colors group-hover:text-indigo-500 group-[.active]:text-white" 
              />
              <span className="font-bold text-sm hidden lg:block">{item.label[lang]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-slate-800 space-y-2">
          <button 
            onClick={() => switchLang(lang === 'en' ? 'km' : 'en')}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Languages size={22} />
            <span className="font-bold text-sm hidden lg:block uppercase">{lang}</span>
          </button>

          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {isDark ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} />}
            <span className="font-bold text-sm hidden lg:block">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
          >
            <LogOut size={22} />
            <span className="font-bold text-sm hidden lg:block">{lang === 'en' ? 'Logout' : 'ចាកចេញ'}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-8 flex-shrink-0">
          <div className="text-slate-400 text-sm font-medium">
            {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'km-KH', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold dark:text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 font-bold border dark:border-slate-700">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}