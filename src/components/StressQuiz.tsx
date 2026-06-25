import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Brain, ShieldAlert, Heart, ArrowRight, HelpCircle, AlertCircle, CheckCircle, RefreshCw, Compass } from "lucide-react";
import { UserProfile } from "../types";

interface StressQuizProps {
  userName: string;
  onComplete: (quizResult: NonNullable<UserProfile["quizResult"]>) => void;
  onSkip?: () => void;
}

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
    pov: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "When you feel a sudden wave of physical anxiety (tight chest, rapid heartbeat, racing thoughts), what is your immediate natural reaction?",
    options: [
      {
        text: "I stop, tell myself it is just temporary, and take a few slow, deep breaths to feel safe and steady.",
        score: 4,
        pov: "Calming and Breathing"
      },
      {
        text: "I try to think logically and focus on a hobby or chore to keep my mind busy.",
        score: 3,
        pov: "Focusing on a Task"
      },
      {
        text: "I look at my phone, watch videos, or eat something sweet/savory to ignore it.",
        score: 2,
        pov: "Distracting Yourself"
      },
      {
        text: "I panic and worry that something is seriously wrong, letting the fear build up and overwhelm me.",
        score: 1,
        pov: "Worrying and Panicking"
      }
    ]
  },
  {
    id: 2,
    text: "When faced with an overwhelming list of tasks or responsibilities, how do you handle the pressure?",
    options: [
      {
        text: "I break the list down, do the most important thing first, and take it one step at a time.",
        score: 4,
        pov: "Taking Step-by-Step Action"
      },
      {
        text: "I write a quick checklist and force myself to finish everything, but feel highly tense the whole time.",
        score: 3,
        pov: "Forcing Yourself Through"
      },
      {
        text: "I put things off and try not to think about them, but feel more guilty as the days pass.",
        score: 2,
        pov: "Putting Things Off"
      },
      {
        text: "I freeze up, feel completely stuck by the pressure, and do nothing while worrying about the worst outcomes.",
        score: 1,
        pov: "Feeling Stuck or Frozen"
      }
    ]
  },
  {
    id: 3,
    text: "When something doesn't go according to plan, what thought pattern immediately occupies your mind?",
    options: [
      {
        text: "I tell myself it is just a small setback, try to learn from it, and speak kindly to myself.",
        score: 4,
        pov: "Kind Self-Talk"
      },
      {
        text: "I feel sad but tell myself to remain strong and quickly look for a different way out.",
        score: 3,
        pov: "Finding a Quick Solution"
      },
      {
        text: "I blame myself, feel like I am not good enough, and try to ignore the bad feelings.",
        score: 2,
        pov: "Blaming Yourself"
      },
      {
        text: "I see it as proof of my worst fears, thinking 'I always ruin things' and getting stuck in self-doubt.",
        score: 1,
        pov: "Thinking You Always Fail"
      }
    ]
  },
  {
    id: 4,
    text: "How aware are you of physical tension (clenched jaw, tight shoulders, shallow breathing) during stressful moments?",
    options: [
      {
        text: "I notice it easily. I regularly check my shoulders, relax my jaw, and take deep belly breaths.",
        score: 4,
        pov: "Listening to Your Body"
      },
      {
        text: "I only notice it at the end of the day when my neck or back is sore, then try to stretch.",
        score: 3,
        pov: "Checking In Sometimes"
      },
      {
        text: "I rarely notice it; I just get used to feeling tense or tired all day long.",
        score: 2,
        pov: "Living with Constant Tension"
      },
      {
        text: "I feel super tense and completely drained, but I ignore it and keep pushing myself.",
        score: 1,
        pov: "Pushing Past Your Limits"
      }
    ]
  },
  {
    id: 5,
    text: "When you are struggling with heavy emotions, how do you process or share them?",
    options: [
      {
        text: "I write down my thoughts, use the journal to find what upset me, or talk openly with someone I trust.",
        score: 4,
        pov: "Sharing and Writing"
      },
      {
        text: "I talk to friends or family, but I hide my deepest worries because I don't want to burden them.",
        score: 3,
        pov: "Holding Some Back"
      },
      {
        text: "I bottle my feelings up and hope they go away, pretending to everyone else that I am perfectly fine.",
        score: 2,
        pov: "Bottling Things Up"
      },
      {
        text: "I feel completely alone and misunderstood, trapped in my own head with no way to let it out.",
        score: 1,
        pov: "Feeling Trapped and Alone"
      }
    ]
  }
];

export default function StressQuiz({ userName, onComplete, onSkip }: StressQuizProps) {
  const [stage, setStage] = useState<"welcome" | "quiz" | "results">("welcome");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const handleStart = () => {
    setStage("quiz");
    setCurrentIdx(0);
    setAnswers([]);
  };

  const handleSelectOption = (score: number) => {
    const nextAnswers = [...answers, score];
    setAnswers(nextAnswers);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStage("results");
    }
  };

  // Calculations for scores
  const totalScore = answers.reduce((acc, curr) => acc + curr, 0);
  
  let anxietyLevel: "Low" | "Moderate" | "High" = "Moderate";
  let recommendedTherapy = "";
  let therapistStyle = "";
  let suggestionsList: string[] = [];

  if (totalScore >= 17) {
    anxietyLevel = "Low";
    recommendedTherapy = "Daily Mindfulness, Deep Breathing, and Kind Self-Reflection Journaling";
    therapistStyle = "Encouraging, positive, and focused on helping you grow and stay strong.";
    suggestionsList = [
      "Practice the 4-second Box Breathing in our breathing tab.",
      "Explore warm self-reflection topics in your CBT Journal.",
      "Chat with THERA AI about your goals and how you are feeling."
    ];
  } else if (totalScore >= 12) {
    anxietyLevel = "Moderate";
    recommendedTherapy = "Thought Reframing, Stress Management, and Relaxing Belly Breathing";
    therapistStyle = "Warm, supportive, and focused on helping you feel balanced and heard.";
    suggestionsList = [
      "Use Guided Belly Breathing to restore your calm.",
      "Write down challenging moments in your CBT Journal to see them in a kinder way.",
      "Talk to THERA AI about what is stressing you out."
    ];
  } else {
    anxietyLevel = "High";
    recommendedTherapy = "Immediate Body Grounding, Muscle Relaxation, and Gentle Breathing";
    therapistStyle = "Very comforting, gentle, and slow-paced. Focuses on making you feel safe and relaxed.";
    suggestionsList = [
      "Try the 4-7-8 Breathing technique to quickly calm your body down.",
      "Use the 'Emotional Unload' journal style to write down all your immediate worries.",
      "Chat with THERA AI for a gentle, calming talk to feel grounded.",
      "Note the 988 crisis contact on the side if you ever need human help."
    ];
  }

  const handleFinish = () => {
    onComplete({
      score: totalScore,
      anxietyLevel,
      takenAt: new Date().toISOString(),
      answers,
      recommendedTherapy
    });
  };

  return (
    <div id="stress-quiz-root" className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-y-auto">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* WELCOME VIEW */}
        {stage === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-6 relative"
          >
            <div className="absolute top-6 right-6 text-indigo-600/20">
              <Compass className="w-16 h-16 rotate-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Getting Started</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-slate-800 tracking-tight leading-tight">
                Welcome to THERA, <span className="text-indigo-600 capitalize">{userName}</span>
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Before entering your peaceful sanctuary, we invite you to complete a quick stress & coping question game. This is designed to help us understand how you feel so we can customize your relaxing exercises immediately.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">How this helps you:</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Tailored Plan:</strong> We recommend the best breathing speeds and journal topics for you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Friendly Chat Tone:</strong> THERA AI changes its voice to match your mood, whether you need warm motivation or gentle comfort.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Mindful Habits:</strong> Helps you see how you handle worry so you can build peaceful new habits.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="py-3 px-5 text-slate-500 hover:text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Skip for now
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {stage === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
          >
            {/* Header progress info */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 font-bold uppercase tracking-widest">
                Question {currentIdx + 1} of {QUESTIONS.length}
              </span>
              <span className="text-indigo-600 font-semibold font-mono">
                {Math.round(((currentIdx + 1) / QUESTIONS.length) * 100)}% Complete
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
                <Brain className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-lg md:text-xl font-sans font-bold text-slate-800 leading-snug pt-1">
                {QUESTIONS[currentIdx].text}
              </h2>
              <p className="text-[11px] text-slate-400 italic">
                Choose the choice that sounds most like how you usually handle things:
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {QUESTIONS[currentIdx].options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(opt.score)}
                  onMouseEnter={() => setHoveredOption(oIdx)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={`w-full p-4 text-left border rounded-2xl transition-all duration-200 text-xs md:text-sm leading-relaxed cursor-pointer relative flex gap-3 items-start
                    ${hoveredOption === oIdx 
                      ? "border-indigo-400 bg-indigo-50/20 shadow-sm translate-x-1" 
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }
                  `}
                >
                  {/* Select ring indicator */}
                  <span className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center mt-0.5 transition-all
                    ${hoveredOption === oIdx ? "border-indigo-500 bg-indigo-500/10" : "border-slate-300"}
                  `}>
                    {hoveredOption === oIdx && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </span>

                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-800">{opt.text}</p>
                    {/* Perspective description helper on hover to educate */}
                    <span className="inline-block text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400">
                      Coping Style: {opt.pov}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-black text-slate-800 tracking-tight">
                All Done!
              </h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Thank you for completing this! Here are your simple stress results and your personal care plan.
              </p>
            </div>

            {/* Core Score display panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

              {/* Stress Level & Score Wheel (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4 text-center space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">My Coping Balance</span>
                
                <div className="relative flex items-center justify-center w-28 h-28">
                  {/* Outer circle track */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      stroke={anxietyLevel === "Low" ? "#10b981" : anxietyLevel === "Moderate" ? "#f59e0b" : "#ef4444"} 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray="263.8"
                      strokeDashoffset={263.8 - (263.8 * (totalScore / 20))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-800 font-sans">{totalScore}<span className="text-xs text-slate-400 font-normal">/20</span></span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">Strength Score</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold font-sans uppercase border
                    ${anxietyLevel === "Low" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ""}
                    ${anxietyLevel === "Moderate" ? "bg-amber-50 text-amber-700 border-amber-100" : ""}
                    ${anxietyLevel === "High" ? "bg-red-50 text-red-700 border-red-100" : ""}
                  `}>
                    {anxietyLevel} Stress Level
                  </span>
                </div>
              </div>

              {/* Dynamic Therapy Assignment (7 cols) */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-3 pl-0 md:pl-2">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">Your Personal Plan</span>
                  <h4 className="font-sans font-bold text-slate-800 text-sm">{recommendedTherapy}</h4>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">THERA AI Chat Tone</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{therapistStyle}</p>
                </div>
              </div>
            </div>

            {/* Prescribed Exercises lists */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Simple next steps to try in your sanctuary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestionsList.map((sug, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-150 hover:border-slate-200 rounded-xl space-y-2 flex flex-col justify-between shadow-xs">
                    <div className="flex gap-2">
                      <span className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{sug}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer action button */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>You can retake this assessment anytime in Settings.</span>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Enter My Peaceful Space</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
