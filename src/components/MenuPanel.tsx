import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

const categoryIcons: Record<string, string> = {
  espresso: "☕",
  brewed: "🫖",
  cold: "🧊",
  food: "🥑",
  pastry: "🥐",
};

const categoryLabels: Record<string, string> = {
  espresso: "Espresso",
  brewed: "Brewed",
  cold: "Cold Drinks",
  food: "Food",
  pastry: "Pastries",
};

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

export function MenuPanel({ shopId }: { shopId: Id<"shops"> }) {
  const items = useQuery(api.menu.getItems, { shopId });
  const toggleAvailability = useMutation(api.menu.toggleAvailability);
  const addItem = useMutation(api.menu.addItem);
  const deleteItem = useMutation(api.menu.deleteItem);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "espresso",
    price: "",
    description: "",
  });

  if (items === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const categories = Array.from(new Set(items.map((i: MenuItem) => i.category))) as string[];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem({
      shopId,
      name: newItem.name,
      category: newItem.category,
      price: parseFloat(newItem.price),
      description: newItem.description,
    });
    setNewItem({ name: "", category: "espresso", price: "", description: "" });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-display font-semibold">Menu Items</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs md:text-sm font-medium rounded-lg md:rounded-xl transition-all"
        >
          {showAddForm ? "Cancel" : "+ Add Item"}
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-stone-900/50 border border-stone-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-stone-400 mb-1.5">Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
                className="w-full px-3 py-2 md:py-2.5 bg-stone-800/50 border border-stone-700/50 rounded-lg text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                placeholder="Flat White"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-stone-400 mb-1.5">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3 py-2 md:py-2.5 bg-stone-800/50 border border-stone-700/50 rounded-lg text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-stone-400 mb-1.5">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
                className="w-full px-3 py-2 md:py-2.5 bg-stone-800/50 border border-stone-700/50 rounded-lg text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                placeholder="5.00"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-stone-400 mb-1.5">Description</label>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                required
                className="w-full px-3 py-2 md:py-2.5 bg-stone-800/50 border border-stone-700/50 rounded-lg text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                placeholder="Smooth espresso with velvety milk"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-semibold rounded-lg text-sm"
          >
            Add to Menu
          </button>
        </form>
      )}

      {/* Menu Categories */}
      {categories.map((category: string) => (
        <div key={category} className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-medium text-stone-300 flex items-center gap-2">
            <span>{categoryIcons[category] || "📦"}</span>
            {categoryLabels[category] || category}
          </h3>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {items
              .filter((i: MenuItem) => i.category === category)
              .map((item: MenuItem) => (
                <div
                  key={item._id}
                  className={`bg-stone-900/50 border rounded-xl md:rounded-2xl p-3 md:p-4 transition-all ${
                    item.available
                      ? "border-stone-800/50 hover:border-stone-700/50"
                      : "border-red-900/30 bg-red-950/10 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 md:mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-semibold text-stone-100 text-sm md:text-base truncate">{item.name}</h4>
                      <p className="text-stone-500 text-[10px] md:text-xs line-clamp-1">{item.description}</p>
                    </div>
                    <div className="text-amber-400 font-semibold text-sm md:text-base whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => toggleAvailability({ itemId: item._id })}
                      className={`flex-1 py-1.5 md:py-2 px-3 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                        item.available
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </button>
                    <button
                      onClick={() => deleteItem({ itemId: item._id })}
                      className="p-1.5 md:p-2 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
