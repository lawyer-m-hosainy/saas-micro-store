import React, { useMemo, useState } from 'react';
import { MapPinned, Plus, Trash2, Truck } from 'lucide-react';

export interface DeliveryOrder {
  id: string;
  zone: string;
  distanceKm: number;
  orderValue: number;
}

export interface CourierRate {
  flatFeePerOrder: number;
}

export interface RouteAnalysis {
  zone: string;
  orderCount: number;
  totalDistanceKm: number;
  inHouseCost: number;
  courierCost: number;
  cheaperOption: 'in-house' | 'courier';
  savings: number;
}

/** يجمّع الطلبات حسب المنطقة الجغرافية، يحسب تكلفة التوصيل الذاتي (وقود + أجر سائق لكل كم) مقابل سعر شركة الشحن الثابت لكل طلب، ويحدد الأوفر */
export function analyzeRoutes(orders: DeliveryOrder[], costPerKm: number, courierRate: CourierRate): RouteAnalysis[] {
  const byZone = new Map<string, DeliveryOrder[]>();
  orders.forEach((o) => {
    const list = byZone.get(o.zone) || [];
    list.push(o);
    byZone.set(o.zone, list);
  });

  return Array.from(byZone.entries()).map(([zone, zoneOrders]) => {
    const totalDistanceKm = zoneOrders.reduce((s, o) => s + o.distanceKm, 0);
    const inHouseCost = totalDistanceKm * costPerKm;
    const courierCost = zoneOrders.length * courierRate.flatFeePerOrder;
    const cheaperOption: RouteAnalysis['cheaperOption'] = inHouseCost <= courierCost ? 'in-house' : 'courier';
    const savings = Math.abs(inHouseCost - courierCost);

    return { zone, orderCount: zoneOrders.length, totalDistanceKm, inHouseCost, courierCost, cheaperOption, savings };
  });
}

const seedOrders = (): DeliveryOrder[] => [
  { id: '1', zone: 'مدينة نصر', distanceKm: 6, orderValue: 350 },
  { id: '2', zone: 'مدينة نصر', distanceKm: 8, orderValue: 220 },
  { id: '3', zone: 'مدينة نصر', distanceKm: 5, orderValue: 180 },
  { id: '4', zone: 'المعادي', distanceKm: 14, orderValue: 500 },
  { id: '5', zone: 'المعادي', distanceKm: 16, orderValue: 300 },
];

export function DeliveryCostRouteOptimizerDemo() {
  const [orders, setOrders] = useState<DeliveryOrder[]>(seedOrders());
  const [costPerKm, setCostPerKm] = useState(4.5);
  const [courierFlatFee, setCourierFlatFee] = useState(35);

  const analysis = useMemo(() => analyzeRoutes(orders, costPerKm, { flatFeePerOrder: courierFlatFee }), [orders, costPerKm, courierFlatFee]);
  const totalSavings = analysis.reduce((s, a) => s + a.savings, 0);

  const updateOrder = (id: string, field: keyof DeliveryOrder, value: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: field === 'zone' ? value : Number(value) || 0 } : o)));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Truck size={20} /> حاسبة ومقارن تكاليف التوصيل (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          <label className="block text-xs text-gray-600 mb-1">تكلفة الكيلومتر بالتوصيل الذاتي (ج.م)</label>
          <input type="number" value={costPerKm} onChange={(e) => setCostPerKm(Number(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          <label className="block text-xs text-gray-600 mb-1">سعر شركة الشحن الثابت لكل طلب (ج.م)</label>
          <input type="number" value={courierFlatFee} onChange={(e) => setCourierFlatFee(Number(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {orders.map((o) => (
          <div key={o.id} className="bg-white p-2.5 rounded-lg border border-gray-100 flex items-center gap-2">
            <input value={o.zone} onChange={(e) => updateOrder(o.id, 'zone', e.target.value)} className="flex-1 px-2 py-1 border rounded-md text-xs" placeholder="المنطقة" />
            <input type="number" value={o.distanceKm} onChange={(e) => updateOrder(o.id, 'distanceKm', e.target.value)} className="w-20 px-2 py-1 border rounded-md text-xs" dir="ltr" placeholder="كم" />
            <input type="number" value={o.orderValue} onChange={(e) => updateOrder(o.id, 'orderValue', e.target.value)} className="w-24 px-2 py-1 border rounded-md text-xs" dir="ltr" placeholder="قيمة الطلب" />
            {orders.length > 1 && <button onClick={() => setOrders((prev) => prev.filter((x) => x.id !== o.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>}
          </div>
        ))}
        <button onClick={() => setOrders((prev) => [...prev, { id: Date.now().toString(), zone: 'منطقة جديدة', distanceKm: 5, orderValue: 100 }])} className="text-sm text-indigo-600 font-medium flex items-center gap-1">
          <Plus size={16} /> إضافة طلب
        </button>
      </div>

      {totalSavings > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold p-3 rounded-lg mb-4">
          💰 توفير محتمل: {totalSavings.toFixed(0)} ج.م لو اخترت الخيار الأوفر في كل منطقة
        </div>
      )}

      <div className="space-y-3">
        {analysis.map((a) => (
          <div key={a.zone} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5"><MapPinned size={14} /> {a.zone}</span>
              <span className="text-[10px] text-gray-400">{a.orderCount} طلب · {a.totalDistanceKm} كم</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-md p-2 text-center ${a.cheaperOption === 'in-house' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-gray-50'}`}>
                <p className="text-[10px] text-gray-500">توصيل ذاتي</p>
                <p className="font-mono font-bold text-sm">{a.inHouseCost.toFixed(0)} ج.م</p>
              </div>
              <div className={`rounded-md p-2 text-center ${a.cheaperOption === 'courier' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-gray-50'}`}>
                <p className="text-[10px] text-gray-500">شركة شحن</p>
                <p className="font-mono font-bold text-sm">{a.courierCost.toFixed(0)} ج.م</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
