import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { AuthScreen } from "./components/AuthScreen";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl md:text-2xl">☕</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {isAuthenticated ? <Dashboard /> : <AuthScreen />}
      <footer className="fixed bottom-0 left-0 right-0 py-2 md:py-3 text-center text-stone-600 text-[10px] md:text-xs bg-stone-950/80 backdrop-blur-sm border-t border-stone-900/50">
        Requested by <a href="https://twitter.com/0xPaulius" className="hover:text-amber-600 transition-colors">@0xPaulius</a> · Built by <a href="https://twitter.com/clonkbot" className="hover:text-amber-600 transition-colors">@clonkbot</a>
      </footer>
    </div>
  );
}
