import { X, Phone, Heart, Globe, AlertOctagon } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  const services = [
    {
      name: "988 Suicide & Crisis Lifeline",
      phone: "988",
      desc: "Free, confidential support available 24/7 across the United States and Canada.",
      web: "https://988lifeline.org",
      sms: "Text 988"
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      desc: "Connect with a volunteer crisis counselor 24/7 via text message.",
      web: "https://www.crisistextline.org",
      sms: "741741"
    },
    {
      name: "The Trevor Project (LGBTQ+)",
      phone: "1-866-488-7386",
      desc: "Specialized crisis intervention and suicide prevention for LGBTQ+ youth.",
      web: "https://www.thetrevorproject.org",
      sms: "Text START to 678-678"
    },
    {
      name: "Veterans Crisis Line",
      phone: "988 (Press 1)",
      desc: "Support specific to military veterans, active duty service members, and families.",
      web: "https://www.veteranscrisisline.net",
      sms: "Text 838255"
    },
    {
      name: "Befrienders Worldwide (International)",
      phone: "Global Help Finder",
      desc: "Find immediate local crisis support services anywhere in the world.",
      web: "https://www.befrienders.org",
      sms: ""
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-red-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Urgent header strip */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <h2 className="font-sans font-bold tracking-tight text-lg">Crisis Support & Safety Hub</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Supportive note */}
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm space-y-2">
            <p className="font-medium">Please know you are not alone, and there is immediate help available.</p>
            <p className="text-red-600 leading-relaxed text-xs">
              MindEase is an AI mental health assistant designed for reflection, wellness practices, and supportive listening. 
              However, we are not equipped to handle medical emergencies or active self-harm crises. 
              If you or someone you know is in danger, please reach out to the professional resources below.
            </p>
          </div>

          <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Emergency Hotlines & Helplines</h3>

          <div className="space-y-4">
            {services.map((srv, index) => (
              <div 
                key={index}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-red-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <h4 className="font-sans font-semibold text-slate-800 text-sm">{srv.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{srv.desc}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 md:self-center">
                  <a 
                    href={`tel:${srv.phone.replace(/\D/g,'')}`}
                    className="px-3.5 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-1.5 transition-all font-medium cursor-pointer hover:bg-red-600 hover:text-white hover:border-red-600 shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{srv.phone}</span>
                  </a>
                  {srv.sms && (
                    <span className="px-2.5 py-1.5 text-xs bg-white text-slate-600 border border-slate-200 rounded-lg font-medium font-mono text-center shadow-xs">
                      {srv.sms}
                    </span>
                  )}
                  <a 
                    href={srv.web} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt close */}
          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all font-medium cursor-pointer"
            >
              Return to MindEase Companion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
