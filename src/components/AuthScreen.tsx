import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 md:w-96 md:h-96 bg-amber-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 md:w-96 md:h-96 bg-orange-600/10 rounded-full blur-3xl" />

      {/* Coffee bean pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-[10%] text-6xl md:text-8xl rotate-12">☕</div>
        <div className="absolute top-40 right-[15%] text-4xl md:text-6xl -rotate-12">☕</div>
        <div className="absolute bottom-32 left-[20%] text-5xl md:text-7xl rotate-45">☕</div>
        <div className="absolute bottom-48 right-[25%] text-3xl md:text-5xl -rotate-45">☕</div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/25 mb-4 md:mb-6">
            <span className="text-3xl md:text-4xl">☕</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-100 tracking-tight">
            Bean Counter
          </h1>
          <p className="text-stone-500 mt-2 text-sm md:text-base">Coffee shop management, simplified</p>
        </div>

        {/* Auth card */}
        <div className="bg-stone-900/50 backdrop-blur-xl border border-stone-800/50 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="font-display text-xl md:text-2xl font-semibold mb-5 md:mb-6 text-center">
            {flow === "signIn" ? "Welcome back" : "Create your shop"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-stone-400 mb-1.5 md:mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-800/50 border border-stone-700/50 rounded-lg md:rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm md:text-base"
                placeholder="barista@coffee.shop"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-stone-400 mb-1.5 md:mb-2">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-800/50 border border-stone-700/50 rounded-lg md:rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm md:text-base"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="text-red-400 text-xs md:text-sm text-center bg-red-500/10 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 md:py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-semibold rounded-lg md:rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {flow === "signIn" ? "Signing in..." : "Creating..."}
                </span>
              ) : (
                flow === "signIn" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-stone-800/50">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="w-full text-center text-stone-400 hover:text-amber-400 transition-colors text-xs md:text-sm"
            >
              {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-800/50" />
            </div>
            <div className="relative flex justify-center text-xs md:text-sm">
              <span className="px-2 bg-stone-900/50 text-stone-500">or</span>
            </div>
          </div>

          <button
            onClick={() => signIn("anonymous")}
            className="mt-4 w-full py-2.5 md:py-3 px-4 bg-stone-800/50 hover:bg-stone-700/50 text-stone-300 font-medium rounded-lg md:rounded-xl transition-all duration-200 border border-stone-700/50 text-sm md:text-base"
          >
            Continue as Guest
          </button>
        </div>

        {/* Features preview */}
        <div className="mt-8 md:mt-12 grid grid-cols-3 gap-3 md:gap-4 text-center">
          {[
            { icon: "📋", label: "Orders" },
            { icon: "☕", label: "Menu" },
            { icon: "📊", label: "Analytics" },
          ].map((item) => (
            <div key={item.label} className="p-3 md:p-4 bg-stone-900/30 rounded-xl md:rounded-2xl border border-stone-800/30">
              <div className="text-xl md:text-2xl mb-1">{item.icon}</div>
              <div className="text-[10px] md:text-xs text-stone-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
