import React from "react";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Wind, 
  User, 
  Settings, 
  LogOut, 
  AlertTriangle,
  Menu,
  X,
  Sun,
  Moon,
  Eye
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
  onTriggerCrisis: () => void;
  userName: string;
  theme: "light" | "dark" | "high-contrast";
  onThemeChange: (theme: "light" | "dark" | "high-contrast") => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  userEmail, 
  onLogout,
  onTriggerCrisis,
  userName,
  theme,
  onThemeChange
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "chat", label: "Therapist AI Chat", icon: MessageSquare },
    { id: "journal", label: "Cognitive Journal", icon: BookOpen },
    { id: "breathing", label: "Guided Breathing", icon: Wind },
    { id: "settings", label: "Profile & Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 text-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
            M
          </div>
          <span className="font-sans font-semibold tracking-tight text-indigo-600">MindEase</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onTriggerCrisis}
            className="px-2.5 py-1 text-xs bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Crisis Help</span>
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between text-slate-600 transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          {/* Logo Brand area */}
          <div className="p-6 border-b border-slate-100 hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
                M
              </div>
              <div>
                <h1 className="font-sans font-bold tracking-tight text-slate-800 leading-tight">MindEase</h1>
                <p className="text-[10px] font-mono tracking-wider text-indigo-600 uppercase">AI Therapist</p>
              </div>
            </div>
          </div>

          {/* User Brief Card */}
          <div className="p-4 mx-4 mt-6 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-sans font-bold text-indigo-600 uppercase">
              {userName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-6 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-semibold" 
                      : "hover:bg-slate-50 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
          {/* Quick Theme Selector */}
          <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase block text-center">Appearance Theme</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onThemeChange("light")}
                className={`p-1.5 rounded-lg flex-1 flex justify-center transition-all cursor-pointer ${
                  theme === "light" 
                    ? "bg-white text-amber-500 shadow-xs border border-slate-200" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onThemeChange("dark")}
                className={`p-1.5 rounded-lg flex-1 flex justify-center transition-all cursor-pointer ${
                  theme === "dark" 
                    ? "bg-slate-700 text-indigo-400 shadow-xs border border-slate-600" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onThemeChange("high-contrast")}
                className={`p-1.5 rounded-lg flex-1 flex justify-center transition-all cursor-pointer ${
                  theme === "high-contrast" 
                    ? "bg-black text-white shadow-xs border border-white" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                }`}
                title="High Contrast Mode"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Access Crisis Button */}
          <button
            onClick={() => {
              onTriggerCrisis();
              setIsOpen(false);
            }}
            className="w-full py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Help (988)</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 md:hidden"
        />
      )}
    </>
  );
}
