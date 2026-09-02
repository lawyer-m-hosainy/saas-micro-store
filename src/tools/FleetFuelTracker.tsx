import React, { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Trash2, Truck } from 'lucide-react';

export interface VehicleEntry {
  id: string;
  name: string;
  driver: string;
  distanceKm: number;
  fuelLiters: number;
  fuelPricePerLiter: number;
}

export interface VehicleResult extends VehicleEntry {
  litersPer100km: number;
  costPerKm: number;
  totalCost: number;
  excessPct: number; // نسبة الزيادة عن متوسط الأسطول
  isAnomaly: boolean;
}

/** يحسب لتر/100كم وتكلفة الكيلومتر لكل سيارة، ويعلّم أي سيارة تتجاوز متوسط الأسطول بأكثر من 20% كهدر محتمل */
export function analyzeFleet(vehicles: VehicleEntry[]): VehicleResult[] {
  const base = vehicles.map((v) => {
    const litersPer100km = v.distanceKm > 0 ? (v.fuelLiters / v.distanceKm) * 100 : 0;
    const totalCost = v.fuelLiters * v.fuelPricePerLiter;
    const costPerKm = v.distanceKm > 0 ? totalCost / v.distanceKm : 0;
    return { ...v, litersPer100km, costPerKm, totalCost, excessPct: 0, isAnomaly: false };
  });

  const validRates = base.filter((v) => v.distanceKm > 0).map((v) => v.litersPer100km);
  const fleetAvg = validRates.length ? validRates.reduce((a, b) => a + b, 0) / validRates.length : 0;

  return base.map((v) => {
    const excessPct = fleetAvg > 0 ? ((v.litersPer100km - fleetAvg) / fleetAvg) * 100 : 0;
    return { ...v, excessPct, isAnomaly: excessPct > 20 };
  });
}

const emptyVehicle = (n: number): VehicleEntry => ({
  id: Date.now().toString() + n,
  name: `سيارة ${n}`,
  driver: '',
  distanceKm: 1200,
  fuelLiters: 110,
  fuelPricePerLiter: 12.75,
});

export function FleetFuelTrackerDemo() {
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([
    { ...emptyVehicle(1), fuelLiters: 100 },
    { ...emptyVehicle(2), fuelLiters: 150 },
  ]);

  const results = useMemo(() => analyzeFleet(vehicles), [vehicles]);
  const totalCost = results.reduce((s, v) => s + v.totalCost, 0);
  const maxCost = Math.max(...results.map((v) => v.totalCost), 1);

  const update = (id: string, field: keyof VehicleEntry, value: string) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: ['name', 'driver'].includes(field) ? value : Number(value) || 0 } : v)));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900">متتبع استهلاك وقود الأسطول (نسخة تعمل بالكامل)</h3>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-5 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">إجمالي تكلفة الوقود للفترة</span>
        <span className="font-mono font-black text-lg text-gray-900" dir="ltr">{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م</span>
      </div>

      <div className="space-y-3 mb-4">
        {results.map((v) => (
          <div key={v.id} className={`bg-white p-4 rounded-lg border shadow-sm ${v.isAnomaly ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-indigo-500" />
                <input value={v.name} onChange={(e) => update(v.id, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none w-24" />
                <input value={v.driver} onChange={(e) => update(v.id, 'driver', e.target.value)} placeholder="اسم السائق" className="text-xs text-gray-500 border-b border-transparent focus:border-indigo-300 outline-none w-24" />
                {v.isAnomaly && (
                  <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                    <AlertTriangle size={10} /> استهلاك زائد {v.excessPct.toFixed(0)}%
                  </span>
                )}
              </div>
              {vehicles.length > 1 && (
                <button onClick={() => setVehicles((prev) => prev.filter((x) => x.id !== v.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <Mini label="المسافة (كم)" value={v.distanceKm} onChange={(val) => update(v.id, 'distanceKm', val)} />
              <Mini label="الوقود المستهلك (لتر)" value={v.fuelLiters} onChange={(val) => update(v.id, 'fuelLiters', val)} />
              <Mini label="سعر اللتر (ج.م)" value={v.fuelPricePerLiter} onChange={(val) => update(v.id, 'fuelPricePerLiter', val)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-md px-2 py-1.5">
                <div className="text-[10px] text-gray-500">معدل الاستهلاك</div>
                <div className="font-mono font-bold text-xs">{v.litersPer100km.toFixed(1)} ل/100كم</div>
              </div>
              <div className="bg-gray-50 rounded-md px-2 py-1.5">
                <div className="text-[10px] text-gray-500">تكلفة الكيلومتر</div>
                <div className="font-mono font-bold text-xs" dir="ltr">{v.costPerKm.toFixed(2)} ج.م</div>
              </div>
              <div className="rounded-md px-2 py-1.5 bg-indigo-50">
                <div className="text-[10px] text-indigo-600">التكلفة الإجمالية</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono font-bold text-xs text-indigo-700" dir="ltr">{v.totalCost.toFixed(0)}</div>
                  <div className="flex-1 bg-indigo-100 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(v.totalCost / maxCost) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setVehicles((prev) => [...prev, emptyVehicle(prev.length + 1)])} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
        <Plus size={16} /> إضافة سيارة أخرى
      </button>
    </div>
  );
}

function Mini({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}
