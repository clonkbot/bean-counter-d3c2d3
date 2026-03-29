import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface CartItem {
  menuItemId: Id<"menuItems">;
  name: string;
  price: number;
  quantity: number;
}

type MenuItem = {
  _id: Id<"menuItems">;
  _creationTime: number;
  shopId: Id<"shops">;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  createdAt: number;
};

export function NewOrderModal({ shopId, onClose }: { shopId: Id<"shops">; onClose: () => void }) {
  const items = useQuery(api.menu.getItems, { shopId });
  const createOrder = useMutation(api.orders.createOrder);
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableItems: MenuItem[] = items?.filter((i: MenuItem) => i.available) || [];
  const categories = Array.from(new Set(availableItems.map((i: MenuItem) => i.category))) as string[];

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((c) => c.menuItemId === item._id);
    if (existing) {
      setCart(cart.map((c) => (c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const removeFromCart = (menuItemId: Id<"menuItems">) => {
    const existing = cart.find((c) => c.menuItemId === menuItemId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c)));
    } else {
      setCart(cart.filter((c) => c.menuItemId !== menuItemId));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (!customerName.trim() || cart.length === 0) return;
    setIsSubmitting(true);
    await createOrder({
      shopId,
      customerName: customerName.trim(),
      items: cart,
    });
    onClose();
  };

  const categoryIcons: Record<string, string> = {
    espresso: "☕",
    brewed: "🫖",
    cold: "🧊",
    food: "🥑",
    pastry: "🥐",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-stone-900 border border-stone-800/50 rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-800/50 shrink-0">
          <h2 className="text-lg md:text-xl font-display font-semibold">New Order</h2>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-lg transition-all"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer Name */}
        <div className="p-4 md:p-6 pb-2 md:pb-3 shrink-0">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name"
            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-stone-800/50 border border-stone-700/50 rounded-lg md:rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm md:text-base"
          />
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 md:pt-3 space-y-4 md:space-y-6">
          {items === undefined ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-3 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : (
            categories.map((category: string) => (
              <div key={category}>
                <h3 className="text-xs md:text-sm font-medium text-stone-400 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                  <span>{categoryIcons[category] || "📦"}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {availableItems
                    .filter((i: MenuItem) => i.category === category)
                    .map((item: MenuItem) => {
                      const inCart = cart.find((c) => c.menuItemId === item._id);
                      return (
                        <button
                          key={item._id}
                          onClick={() => addToCart(item)}
                          className={`p-2.5 md:p-3 rounded-lg md:rounded-xl text-left transition-all ${
                            inCart
                              ? "bg-amber-500/20 border-2 border-amber-500/50"
                              : "bg-stone-800/50 border border-stone-700/50 hover:border-stone-600/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-stone-100 text-xs md:text-sm line-clamp-1">{item.name}</span>
                            {inCart && (
                              <span className="bg-amber-500 text-stone-950 text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full ml-1">
                                {inCart.quantity}
                              </span>
                            )}
                          </div>
                          <div className="text-amber-400/80 text-xs md:text-sm mt-0.5 md:mt-1">${item.price.toFixed(2)}</div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t border-stone-800/50 p-4 md:p-6 bg-stone-900/80 shrink-0">
            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4 max-h-24 overflow-y-auto">
              {cart.map((item) => (
                <button
                  key={item.menuItemId}
                  onClick={() => removeFromCart(item.menuItemId)}
                  className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-stone-800 hover:bg-red-900/30 hover:text-red-400 rounded-full text-[10px] md:text-xs transition-all group"
                >
                  <span>{item.quantity}x {item.name}</span>
                  <span className="text-stone-500 group-hover:text-red-400">×</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-stone-500 text-[10px] md:text-xs">Total</div>
                <div className="text-xl md:text-2xl font-bold text-amber-400">${total.toFixed(2)}</div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!customerName.trim() || isSubmitting}
                className="px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-semibold rounded-lg md:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
