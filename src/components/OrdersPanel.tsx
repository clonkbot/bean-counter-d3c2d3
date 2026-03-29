import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  preparing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ready: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-stone-500/20 text-stone-400 border-stone-500/30",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Done",
};

const nextStatus: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};

type OrderItem = {
  menuItemId: Id<"menuItems">;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: Id<"orders">;
  _creationTime: number;
  shopId: Id<"shops">;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: number;
};

export function OrdersPanel({ shopId }: { shopId: Id<"shops"> }) {
  const orders = useQuery(api.orders.getActiveOrders, { shopId });
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  if (orders === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 md:py-20">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl bg-stone-800/50 flex items-center justify-center">
          <span className="text-3xl md:text-4xl opacity-50">📋</span>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-stone-400 mb-2">No active orders</h3>
        <p className="text-stone-500 text-sm md:text-base">New orders will appear here in real-time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-display font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Active Orders
          <span className="text-stone-500 text-sm md:text-base font-normal">({orders.length})</span>
        </h2>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        {orders.map((order: Order) => (
          <div
            key={order._id}
            className="bg-stone-900/50 border border-stone-800/50 rounded-xl md:rounded-2xl p-4 md:p-5 hover:border-stone-700/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div>
                <h3 className="font-semibold text-base md:text-lg text-stone-100">{order.customerName}</h3>
                <p className="text-[10px] md:text-xs text-stone-500">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium border ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <div className="space-y-1.5 md:space-y-2 mb-4">
              {order.items.map((item: OrderItem, idx: number) => (
                <div key={idx} className="flex justify-between text-xs md:text-sm">
                  <span className="text-stone-300">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-stone-500">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-stone-800/50">
              <div className="font-semibold text-amber-400 text-sm md:text-base">
                ${order.total.toFixed(2)}
              </div>
              {nextStatus[order.status] && (
                <button
                  onClick={() => updateStatus({ orderId: order._id, status: nextStatus[order.status] })}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs md:text-sm font-medium rounded-lg transition-all"
                >
                  {order.status === "pending" && "Start Preparing"}
                  {order.status === "preparing" && "Mark Ready"}
                  {order.status === "ready" && "Complete"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
