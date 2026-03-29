import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { OrdersPanel } from "./OrdersPanel";
import { MenuPanel } from "./MenuPanel";
import { StatsPanel } from "./StatsPanel";
import { NewOrderModal } from "./NewOrderModal";

type Tab = "orders" | "menu" | "stats";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const shop = useQuery(api.shops.getMyShop);
  const createShop = useMutation(api.shops.createShop);
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [shopName, setShopName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (shop === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (shop === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900/50 backdrop-blur-xl border border-stone-800/50 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/25">
            <span className="text-3xl md:text-4xl">☕</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Name Your Shop</h2>
          <p className="text-stone-500 mb-6 md:mb-8 text-sm md:text-base">Give your coffee shop a memorable name</p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!shopName.trim()) return;
              setIsCreating(true);
              await createShop({ name: shopName.trim() });
              setIsCreating(false);
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="The Daily Grind"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-800/50 border border-stone-700/50 rounded-lg md:rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-center text-base md:text-lg"
            />
            <button
              type="submit"
              disabled={isCreating || !shopName.trim()}
              className="w-full py-2.5 md:py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-semibold rounded-lg md:rounded-xl transition-all disabled:opacity-50 text-sm md:text-base"
            >
              {isCreating ? "Creating..." : "Open Shop"}
            </button>
          </form>

          <button
            onClick={() => signOut()}
            className="mt-4 text-stone-500 hover:text-stone-300 transition-colors text-xs md:text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "orders", label: "Orders", icon: "📋" },
    { id: "menu", label: "Menu", icon: "☕" },
    { id: "stats", label: "Stats", icon: "📊" },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50">
        <div className="max-w-6xl mx-auto px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-base md:text-lg">☕</span>
            </div>
            <div>
              <h1 className="font-display text-base md:text-xl font-bold text-stone-100 truncate max-w-[120px] md:max-w-none">
                {shop.name}
              </h1>
              <p className="text-[10px] md:text-xs text-stone-500 hidden md:block">Bean Counter</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setShowNewOrder(true)}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-semibold rounded-lg md:rounded-xl transition-all shadow-lg shadow-amber-500/20 text-xs md:text-sm flex items-center gap-1 md:gap-2"
            >
              <span className="text-sm md:text-base">+</span>
              <span className="hidden sm:inline">New Order</span>
              <span className="sm:hidden">Order</span>
            </button>
            <button
              onClick={() => signOut()}
              className="p-1.5 md:p-2 text-stone-500 hover:text-stone-300 transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "text-amber-400"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6">
        {activeTab === "orders" && <OrdersPanel shopId={shop._id} />}
        {activeTab === "menu" && <MenuPanel shopId={shop._id} />}
        {activeTab === "stats" && <StatsPanel shopId={shop._id} />}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-8 left-4 right-4 bg-stone-900/90 backdrop-blur-xl border border-stone-800/50 rounded-2xl shadow-2xl shadow-stone-950/50 z-50">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-stone-500"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* New Order Modal */}
      {showNewOrder && (
        <NewOrderModal shopId={shop._id} onClose={() => setShowNewOrder(false)} />
      )}
    </div>
  );
}
