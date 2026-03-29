import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type DayStat = {
  date: string;
  orders: number;
  revenue: number;
};

export function StatsPanel({ shopId }: { shopId: Id<"shops"> }) {
  const todayStats = useQuery(api.orders.getTodayStats, { shopId });
  const weekStats = useQuery(api.orders.getWeekStats, { shopId });

  if (todayStats === undefined || weekStats === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const maxRevenue = Math.max(...weekStats.map((d: DayStat) => d.revenue), 1);
  const totalWeekRevenue = weekStats.reduce((sum: number, d: DayStat) => sum + d.revenue, 0);
  const totalWeekOrders = weekStats.reduce((sum: number, d: DayStat) => sum + d.orders, 0);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Today's Stats */}
      <div>
        <h2 className="text-lg md:text-xl font-display font-semibold mb-4 md:mb-6">Today's Performance</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="text-amber-400/70 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-1 md:mb-2">Revenue</div>
            <div className="text-2xl md:text-4xl font-bold text-amber-400">
              ${todayStats.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="text-blue-400/70 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-1 md:mb-2">Orders</div>
            <div className="text-2xl md:text-4xl font-bold text-blue-400">{todayStats.totalOrders}</div>
          </div>
        </div>
      </div>

      {/* Week Chart */}
      <div>
        <h2 className="text-lg md:text-xl font-display font-semibold mb-4 md:mb-6">Last 7 Days</h2>
        <div className="bg-stone-900/50 border border-stone-800/50 rounded-xl md:rounded-2xl p-4 md:p-6">
          <div className="flex items-end justify-between h-40 md:h-48 gap-1 md:gap-2 mb-4">
            {weekStats.map((day: DayStat, idx: number) => {
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              const isToday = idx === weekStats.length - 1;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    {day.revenue > 0 && (
                      <div className="text-[8px] md:text-xs text-stone-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${day.revenue.toFixed(0)}
                      </div>
                    )}
                    <div
                      className={`w-full max-w-[28px] md:max-w-[40px] rounded-t-md md:rounded-t-lg transition-all ${
                        isToday
                          ? "bg-gradient-to-t from-amber-600 to-amber-400"
                          : "bg-gradient-to-t from-stone-700 to-stone-600 group-hover:from-amber-600/50 group-hover:to-amber-400/50"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <div className={`mt-2 text-[8px] md:text-xs ${isToday ? "text-amber-400 font-medium" : "text-stone-500"}`}>
                    {new Date(day.date).toLocaleDateString([], { weekday: "short" }).slice(0, 2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Summary */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-stone-800/50">
            <div>
              <div className="text-stone-500 text-[10px] md:text-xs mb-1">Week Total</div>
              <div className="text-lg md:text-2xl font-semibold text-stone-200">${totalWeekRevenue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-stone-500 text-[10px] md:text-xs mb-1">Total Orders</div>
              <div className="text-lg md:text-2xl font-semibold text-stone-200">{totalWeekOrders}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Avg Order", value: totalWeekOrders > 0 ? `$${(totalWeekRevenue / totalWeekOrders).toFixed(2)}` : "$0", icon: "💰" },
          { label: "Best Day", value: `$${Math.max(...weekStats.map((d: DayStat) => d.revenue)).toFixed(0)}`, icon: "🏆" },
          { label: "Peak Orders", value: Math.max(...weekStats.map((d: DayStat) => d.orders)), icon: "📈" },
          { label: "Active Days", value: weekStats.filter((d: DayStat) => d.orders > 0).length, icon: "📅" },
        ].map((stat) => (
          <div key={stat.label} className="bg-stone-900/50 border border-stone-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl mb-1 md:mb-2">{stat.icon}</div>
            <div className="text-base md:text-xl font-semibold text-stone-200">{stat.value}</div>
            <div className="text-stone-500 text-[10px] md:text-xs">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
