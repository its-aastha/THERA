import React from "react";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Wind, 
  Settings, 
  LogOut, 
  AlertTriangle,
  Menu,
  X
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
            T
          </div>
          <span className="font-sans font-semibold tracking-tight text-indigo-600">THERA</span>
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
        fixed inset-y-0 left-0 z-30 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200 flex flex-col justify-between text-slate-600 transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-[calc(100vh-3rem)] md:my-6 md:ml-6 md:rounded-3xl md:border md:border-slate-200/60 md:shadow-2xl md:shadow-slate-200/30 overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          {/* Logo Brand area */}
          <div className="p-6 border-b border-slate-100 hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-150 animate-pulse">
                T
              </div>
              <div>
                <h1 className="font-sans font-extrabold tracking-tight text-slate-850 leading-tight">THERA</h1>
                <p className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase font-bold">AI Sanctuary</p>
              </div>
            </div>
          </div>

          {/* User Brief Card */}
          <div className="p-4 mx-4 mt-6 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center font-sans font-black text-indigo-600 uppercase shadow-inner">
              {userName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{userEmail}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-6 space-y-2">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 border-r-4 border-indigo-400" 
                      : "hover:bg-slate-50/80 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-100 bg-transparent">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
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
