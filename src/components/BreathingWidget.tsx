import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Heart, Info, Eye, EyeOff, Wind } from "lucide-react";

interface BreathingMode {
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  description: string;
}

const MODES: BreathingMode[] = [
  {
    name: "Calming (4-7-8)",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    description: "Deep relaxing exercise that works as a natural tranquilizer for the nervous system."
  },
  {
    name: "Box Breathing (4-4-4-4)",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    description: "Sustained concentration booster used by Navy SEALs to maintain calm, peak focus."
  },
  {
    name: "Equal Breathing (4-4)",
    inhale: 4,
    hold1: 0,
    exhale: 4,
    hold2: 0,
    description: "Balanced respiration pattern to steady your heartbeat, ground emotions, and clear stress."
  }
];

export default function BreathingWidget() {
  const [selectedModeIdx, setSelectedModeIdx] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [stage, setStage] = useState<"Ready" | "Inhale" | "Hold" | "Exhale" | "Hold (Out)">("Ready");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [hideInstruction, setHideInstruction] = useState(false);

  const mode = MODES[selectedModeIdx];

  // Stop/reset when mode changes
  useEffect(() => {
    setIsActive(false);
    setStage("Ready");
    setSecondsLeft(0);
  }, [selectedModeIdx]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive) {
      if (secondsLeft <= 0) {
        // Move to the next breathing stage
        let nextStage: typeof stage = "Ready";
        let duration = 0;

        if (stage === "Ready" || stage === "Hold (Out)") {
          nextStage = "Inhale";
          duration = mode.inhale;
        } else if (stage === "Inhale") {
          if (mode.hold1 > 0) {
            nextStage = "Hold";
            duration = mode.hold1;
          } else {
            nextStage = "Exhale";
            duration = mode.exhale;
          }
        } else if (stage === "Hold") {
          nextStage = "Exhale";
          duration = mode.exhale;
        } else if (stage === "Exhale") {
          if (mode.hold2 > 0) {
            nextStage = "Hold (Out)";
            duration = mode.hold2;
          } else {
            nextStage = "Inhale";
            duration = mode.inhale;
            setTotalCycles((prev) => prev + 1);
          }
        } else if (stage === "Hold (Out)") {
          nextStage = "Inhale";
          duration = mode.inhale;
          setTotalCycles((prev) => prev + 1);
        }

        setStage(nextStage);
        setSecondsLeft(duration);
      } else {
        timer = setTimeout(() => {
          setSecondsLeft((prev) => prev - 1);
        }, 1000);
      }
    } else {
      if (timer) clearTimeout(timer);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, secondsLeft, stage, mode]);

  const toggleActive = () => {
    if (!isActive) {
      setIsActive(true);
      setStage("Inhale");
      setSecondsLeft(mode.inhale);
    } else {
      setIsActive(false);
    }
  };

  const resetExercise = () => {
    setIsActive(false);
    setStage("Ready");
    setSecondsLeft(0);
    setTotalCycles(0);
  };

  // Determine circle color and scaling classes based on stage
  const getCircleStageStyles = () => {
    if (!isActive || stage === "Ready") {
      return {
        bg: "bg-slate-50 border-slate-200 text-indigo-600",
        label: "Ready",
        scale: "scale-100",
        glow: "shadow-sm border-slate-200/80"
      };
    }
    switch (stage) {
      case "Inhale":
        return {
          bg: "bg-indigo-50 border-indigo-400 text-indigo-700",
          label: "Inhale Slowly",
          scale: "scale-125 md:scale-135 transition-transform duration-[4000ms] ease-in-out",
          glow: "shadow-lg shadow-indigo-600/10"
        };
      case "Hold":
        return {
          bg: "bg-violet-50 border-violet-400 text-violet-700",
          label: "Hold Breath",
          scale: "scale-125 md:scale-135 transition-all duration-[7000ms]",
          glow: "shadow-lg shadow-violet-600/10"
        };
      case "Exhale":
        return {
          bg: "bg-emerald-50 border-emerald-400 text-emerald-700",
          label: "Exhale Gently",
          scale: "scale-95 transition-transform duration-[6000ms] ease-in-out",
          glow: "shadow-md shadow-emerald-600/5"
        };
      case "Hold (Out)":
        return {
          bg: "bg-slate-100 border-slate-200 text-slate-600",
          label: "Hold (Empty)",
          scale: "scale-95 transition-all duration-[4000ms]",
          glow: ""
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-200 text-indigo-600",
          label: "Breathe",
          scale: "scale-100",
          glow: ""
        };
    }
  };

  const circleStyles = getCircleStageStyles();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-1">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Wind className="w-6 h-6 text-indigo-600" />
            <span>Guided Breathing Sanctuary</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Ground your thoughts, lower anxiety, and oxygenate your system using ancient, scientifically proven breathing cycles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHideInstruction(!hideInstruction)}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-xs flex items-center gap-1.5 cursor-pointer bg-white shadow-xs"
          >
            {hideInstruction ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{hideInstruction ? "Show Tip" : "Hide Tip"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Choose patterns */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Select Breathing Technique</h3>
          
          <div className="space-y-3">
            {MODES.map((m, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedModeIdx(idx)}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedModeIdx === idx
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm shadow-indigo-600/5"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <div className="font-semibold text-slate-800 text-sm flex items-center justify-between">
                  <span>{m.name}</span>
                  <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                    {m.inhale}-{m.hold1 || "0"}-{m.exhale}-{m.hold2 || "0"}s
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{m.description}</p>
              </button>
            ))}
          </div>

          {!hideInstruction && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-xs text-indigo-700">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-850">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tip for beginners</span>
              </div>
              <p className="leading-relaxed text-indigo-600">
                Sit comfortably in a quiet room, with your shoulders dropped. Inhale softly through your nose, expand your abdomen, and exhale completely through your mouth with a gentle whoosh.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Resonating Stage canvas and buttons */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-80 w-full flex items-center justify-center relative select-none">
            
            {/* Pulsating background aura */}
            <div className={`absolute w-40 h-40 rounded-full blur-3xl opacity-15 transition-all duration-1000 ${
              stage === "Inhale" ? "bg-indigo-500" : stage === "Hold" ? "bg-violet-500" : stage === "Exhale" ? "bg-emerald-500" : "bg-slate-300"
            }`} />

            {/* Central Circle */}
            <div className={`
              w-44 h-44 rounded-full border-2 flex flex-col items-center justify-center text-center p-4 shadow-sm select-none transition-all duration-1000 relative z-10
              ${circleStyles.bg} ${circleStyles.scale} ${circleStyles.glow}
            `}>
              {/* Timing or text */}
              <div className="font-sans font-bold text-sm leading-tight text-slate-800 mb-1">
                {circleStyles.label}
              </div>
              
              {isActive && secondsLeft > 0 && (
                <div className="font-mono text-3xl font-extrabold text-slate-950 tracking-tighter tabular-nums">
                  {secondsLeft}s
                </div>
              )}

              {!isActive && (
                <div className="text-[10px] text-indigo-600 uppercase font-semibold font-mono tracking-wider animate-pulse">
                  Click Play
                </div>
              )}
            </div>

            {/* Inhale / Hold / Exhale outline markers for visualization */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border border-dashed border-slate-200 rounded-full" />
              <div className="w-80 h-80 border border-dashed border-slate-100 rounded-full" />
            </div>
          </div>

          {/* Core Controls */}
          <div className="space-y-4 text-center mt-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleActive}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  isActive 
                    ? "bg-amber-600 hover:bg-amber-500 text-white" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                }`}
              >
                {isActive ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white" />}
                <span>{isActive ? "Pause Sanctuary" : "Start Guided Respiration"}</span>
              </button>

              <button
                onClick={resetExercise}
                className="p-3 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-xs"
                title="Reset Exercise"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Counter bar */}
            <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-400 mt-2">
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500/85 fill-red-500/10" />
                <span>Current Cycle: <strong className="text-slate-700 font-semibold">{totalCycles}</strong></span>
              </div>
              <span className="text-slate-200">|</span>
              <span>Active Cycle Technique: <strong className="text-slate-700 font-semibold">{mode.name.split(" ")[0]}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
