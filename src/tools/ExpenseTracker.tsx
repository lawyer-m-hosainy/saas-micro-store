import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export function ExpenseTrackerDemo() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'income', amount: 5000, description: 'راتب شهري', date: new Date().toISOString().split('T')[0] },
    { id: '2', type: 'expense', amount: 150, description: 'فاتورة إنترنت', date: new Date().toISOString().split('T')[0] },
  ]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const addTransaction = () => {
    if (!amount || !description) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    const newTx: Transaction = {
      id: Date.now().toString(),
      type,
      amount: parsedAmount,
      description,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([newTx, ...transactions]);
    setAmount('');
    setDescription('');
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-6 text-indigo-900">أداة متتبع المصروفات (نسخة تعمل بالكامل)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">الرصيد الحالي</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-red-500'}`} dir="ltr">${balance}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
            <DollarSign size={24} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-green-500" dir="ltr">${totalIncome}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-500">
            <TrendingUp size={24} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">إجمالي المصروفات</p>
            <p className="text-2xl font-bold text-red-500" dir="ltr">${totalExpense}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-500">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-700 mb-4">إضافة معاملة جديدة</h4>
          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                onClick={() => setType('expense')}
              >
                مصروف
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                onClick={() => setType('income')}
              >
                إيراد
              </button>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">المبلغ</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="0.00" dir="ltr" />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">البيان / الوصف</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="مثال: شراء معدات" />
            </div>
            
            <button onClick={addTransaction} disabled={!amount || !description} className="w-full mt-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <Plus size={18} /> إضافة المعاملة
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-4">سجل المعاملات</h4>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">لا توجد معاملات مسجلة بعد.</div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{t.description}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                      {t.type === 'income' ? '+' : '-'}${t.amount}
                    </span>
                    <button onClick={() => removeTransaction(t.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
