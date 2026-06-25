import React from "react";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Wind, 
  Settings, 
  LogOut, 
  Sparkles,
  User
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
  userName: string;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  userEmail, 
  onLogout,
  userName
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "chat", label: "Therapist AI Chat", icon: MessageSquare },
    { id: "journal", label: "Cognitive Journal", icon: BookOpen },
    { id: "breathing", label: "Guided Breathing", icon: Wind },
    { id: "settings", label: "Profile & Settings", icon: Settings },
  ];

  return (
    <header className="w-full bg-slate-100/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Area (Left) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-sans font-black text-white shadow-md shadow-indigo-500/25 animate-pulse">
            T
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <h1 className="font-sans font-extrabold tracking-tight text-slate-900 leading-none">THERA</h1>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <p className="text-[10px] font-mono tracking-wider text-indigo-500 uppercase font-bold">AI Sanctuary</p>
          </div>
        </div>

        {/* Navigation Buttons (Center) */}
        <nav className="flex items-center gap-1.5 md:gap-3 bg-slate-50/45 p-1 rounded-2xl border border-slate-200/45 overflow-x-auto no-scrollbar scroll-smooth">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div key={item.id} className="relative group shrink-0">
                <button
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 relative cursor-pointer outline-none ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105" 
                      : "text-slate-500 hover:text-indigo-400 hover:bg-slate-100/80 hover:scale-105 active:scale-95"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:rotate-3" />
                  
                  {/* Subtle active state underline dot */}
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
                  )}
                </button>

                {/* Sleek Tooltip - Revealed on Hover */}
                <div className="absolute top-[110%] left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 text-slate-100 text-[11px] font-bold rounded-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap shadow-xl border border-slate-200/10 z-50 flex items-center gap-1">
                  <span>{item.label}</span>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Card & Logout Button (Right) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* User Profile avatar */}
          <div className="hidden lg:flex items-center gap-2 max-w-40 bg-slate-50/40 p-1.5 pr-3 rounded-xl border border-slate-200/40">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center font-sans font-extrabold text-indigo-400 uppercase text-xs">
              {userName.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{userName}</p>
            </div>
          </div>

          {/* Red Logout Button with Advanced Hover */}
          <div className="relative group shrink-0">
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-3 md:px-3.5 md:py-3 rounded-xl text-xs font-black bg-red-950/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/30 hover:border-red-500 hover:shadow-lg hover:shadow-red-600/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline ml-1.5">Sign Out</span>
            </button>

            {/* Logout Tooltip */}
            <div className="absolute top-[110%] left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-red-950 text-red-200 text-[11px] font-bold rounded-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap shadow-xl border border-red-900/20 z-50">
              Exit Sanctuary
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
