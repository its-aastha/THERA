import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Smile, Mail, Lock, Heart, Shield, Sparkles, User } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess(credential.user);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(credential.user);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      let friendlyMessage = "Authentication failed. Please check your credentials.";
      if (err.code === "auth/operation-not-allowed") {
        friendlyMessage = "Email & Password Authentication is currently disabled in your Firebase console. Please go to the Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', and enable 'Email/Password'. In the meantime, you can sign in with Google or use the Guest Mode below.";
      } else if (err.code === "auth/invalid-credential") {
        friendlyMessage = "Incorrect email or password. Please try again.";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already registered. Try logging in instead.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password should be at least 6 characters long.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setError("");
    setLoading(true);
    try {
      const credential = await signInAnonymously(auth);
      onAuthSuccess(credential.user);
    } catch (err: any) {
      console.warn("Anonymous sign in blocked, fallback to Mock Guest Mode:", err);
      // Fallback guest mode object if Firebase Auth is not configured or blocked by security
      onAuthSuccess({
        uid: "guest_user_123",
        email: "guest@thera.co",
        isAnonymous: true,
        displayName: "Guest"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      onAuthSuccess(credential.user);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Google Sign-In is not enabled in your Firebase Console. Please enable 'Google' under Authentication -> Sign-in method, or use the Guest Mode below.");
      } else {
        setError("Google authentication failed. Please try again or use Guest Mode.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Decorative floating lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl animate-in fade-in zoom-in duration-300">
        
        {/* Core Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 text-white items-center justify-center font-bold text-xl shadow-md">
            T
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">THERA Sanctuary</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Your secure, therapeutic cognitive companion for stress relief, mental growth, and guided grounding.
            </p>
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Your preferred name..."
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Min 6 characters..."
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all disabled:opacity-60 cursor-pointer mt-6"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isRegistering ? "Create Sanctuary Account" : "Access Sanctuary"}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3.5 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
            or continue with
          </span>
        </div>

        {/* Auth providers */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleGuestMode}
            disabled={loading}
            type="button"
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Instant Anonymous Guest Entry</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="text-center mt-6 text-xs text-slate-500">
          {isRegistering ? (
            <p>
              Already have an account?{" "}
              <button 
                onClick={() => setIsRegistering(false)} 
                className="text-indigo-600 font-semibold hover:underline cursor-pointer hover:text-indigo-700"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to THERA?{" "}
              <button 
                onClick={() => setIsRegistering(true)} 
                className="text-indigo-600 font-semibold hover:underline cursor-pointer hover:text-indigo-700"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

        {/* Safe Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-8">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>HIPAA-inspired private client-side encryption</span>
        </div>

      </div>
    </div>
  );
}
