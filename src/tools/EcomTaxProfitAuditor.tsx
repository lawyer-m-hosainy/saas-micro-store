import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';

export interface AuditInputs {
  revenue: number;
  cogsPct: number;
  gatewayFeePct: number;
  shippingCostPerOrder: number;
  ordersCount: number;
  returnRatePct: number;
  vatPct: number;
  incomeTaxPct: number;
}

export interface AuditResult {
  cogs: number;
  gatewayFees: number;
  shippingCost: number;
  returnsLoss: number;
  vatDue: number;
  grossProfit: number;
  incomeTax: number;
  netProfit: number;
  netMarginPct: number;
  lowMargin: boolean;
}

/** يحسب صافي الربح الحقيقي بعد خصم تكلفة البضاعة، العمولات، الشحن، المرتجعات، والضرائب */
export function computeEcomAudit(i: AuditInputs): AuditResult {
  const cogs = i.revenue * (i.cogsPct / 100);
  const gatewayFees = i.revenue * (i.gatewayFeePct / 100);
  const shippingCost = i.shippingCostPerOrder * i.ordersCount;
  const returnsLoss = i.revenue * (i.returnRatePct / 100);

  const revenueAfterReturns = i.revenue - returnsLoss;
  const vatDue = revenueAfterReturns * (i.vatPct / 100);

  const grossProfit = revenueAfterReturns - cogs - gatewayFees - shippingCost - vatDue;
  const incomeTax = grossProfit > 0 ? grossProfit * (i.incomeTaxPct / 100) : 0;
  const netProfit = grossProfit - incomeTax;
  const netMarginPct = i.revenue > 0 ? (netProfit / i.revenue) * 100 : 0;

  return {
    cogs, gatewayFees, shippingCost, returnsLoss, vatDue,
    grossProfit, incomeTax, netProfit, netMarginPct,
    lowMargin: netMarginPct < 10,
  };
}

export function EcomTaxProfitAuditorDemo() {
  const [inputs, setInputs] = useState<AuditInputs>({
    revenue: 250000,
    cogsPct: 40,
    gatewayFeePct: 2.5,
    shippingCostPerOrder: 45,
    ordersCount: 900,
    returnRatePct: 6,
    vatPct: 14,
    incomeTaxPct: 22.5,
  });

  const result = useMemo(() => computeEcomAudit(inputs), [inputs]);

  const set = (key: keyof AuditInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInputs((prev) => ({ ...prev, [key]: isNaN(v) ? 0 : v }));
  };

  const exportStatement = () => {
    const rows = [
      ['البند', 'القيمة (ج.م)'],
      ['الإيرادات الإجمالية', inputs.revenue],
      ['خسارة المرتجعات', -Math.round(result.returnsLoss)],
      ['تكلفة البضاعة المباعة (COGS)', -Math.round(result.cogs)],
      ['عمولات الدفع الإلكتروني', -Math.round(result.gatewayFees)],
      ['تكلفة الشحن الإجمالية', -Math.round(result.shippingCost)],
      ['ضريبة القيمة المضافة المستحقة', -Math.round(result.vatDue)],
      ['الربح قبل ضريبة الدخل', Math.round(result.grossProfit)],
      ['ضريبة الدخل المقدرة', -Math.round(result.incomeTax)],
      ['صافي الربح النهائي', Math.round(result.netProfit)],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecom-profit-statement.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900">حاسبة ضرائب التجارة الإلكترونية وصافي الربح (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <h4 className="font-bold text-gray-700 mb-1 text-sm">بيانات الفترة المالية</h4>
          <Field label="إجمالي الإيرادات (ج.م)" value={inputs.revenue} onChange={set('revenue')} />
          <Field label="عدد الطلبات" value={inputs.ordersCount} onChange={set('ordersCount')} />
          <Field label="تكلفة الشحن لكل طلب (ج.م)" value={inputs.shippingCostPerOrder} onChange={set('shippingCostPerOrder')} />
          <Field label="تكلفة البضاعة المباعة COGS (%)" value={inputs.cogsPct} onChange={set('cogsPct')} step="0.5" />
          <Field label="عمولة بوابة الدفع (%)" value={inputs.gatewayFeePct} onChange={set('gatewayFeePct')} step="0.1" />
          <Field label="نسبة المرتجعات المتوقعة (%)" value={inputs.returnRatePct} onChange={set('returnRatePct')} step="0.5" />
          <Field label="ضريبة القيمة المضافة (%)" value={inputs.vatPct} onChange={set('vatPct')} step="0.5" />
          <Field label="ضريبة الدخل على النشاط (%)" value={inputs.incomeTaxPct} onChange={set('incomeTaxPct')} step="0.5" />
        </div>

        <div className="space-y-4">
          <div className={`p-5 rounded-lg border ${result.lowMargin ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="text-xs font-bold text-gray-500 mb-1">صافي الربح الحقيقي</div>
            <div className={`text-3xl font-black font-mono ${result.lowMargin ? 'text-red-600' : 'text-emerald-600'}`} dir="ltr">
              {result.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م
            </div>
            <div className="text-xs text-gray-500 mt-1">هامش صافي: {result.netMarginPct.toFixed(1)}%</div>
            {result.lowMargin && (
              <div className="flex items-center gap-1.5 text-xs text-red-700 font-medium mt-2">
                <AlertTriangle size={14} /> الهامش أقل من 10% — راجع تكلفة البضاعة أو نسبة المرتجعات
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-1.5 text-xs">
            <Row label="الإيرادات" value={inputs.revenue} />
            <Row label="خسارة المرتجعات" value={-result.returnsLoss} />
            <Row label="تكلفة البضاعة (COGS)" value={-result.cogs} />
            <Row label="عمولات الدفع" value={-result.gatewayFees} />
            <Row label="الشحن" value={-result.shippingCost} />
            <Row label="ضريبة القيمة المضافة" value={-result.vatDue} />
            <div className="border-t border-gray-100 my-1" />
            <Row label="الربح قبل الضريبة" value={result.grossProfit} bold />
            <Row label="ضريبة الدخل" value={-result.incomeTax} />
          </div>

          <button onClick={exportStatement} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> تصدير كشف حساب تحليلي (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, step }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type="number" step={step} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className="font-mono" dir="ltr">{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
    </div>
  );
}
