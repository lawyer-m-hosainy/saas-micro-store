import React, { useMemo, useState } from 'react';
import { Bell, Copy, Send } from 'lucide-react';

export type Priority = 'info' | 'warning' | 'critical';

const PRIORITY_EMOJI: Record<Priority, string> = { info: 'ℹ️', warning: '⚠️', critical: '🚨' };
const PRIORITY_COLOR: Record<Priority, number> = { info: 0x4f46e5, warning: 0xf59e0b, critical: 0xef4444 };

/** يبني Payload حقيقي مطابق لمواصفات Discord Webhook (embeds بلون حسب الأولوية) */
export function buildDiscordPayload(title: string, message: string, priority: Priority): object {
  return {
    content: priority === 'critical' ? '@here' : undefined,
    embeds: [
      {
        title: `${PRIORITY_EMOJI[priority]} ${title}`,
        description: message,
        color: PRIORITY_COLOR[priority],
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/** يبني نص رسالة Telegram بصيغة Markdown مطابقة لمواصفات Bot API */
export function buildTelegramMessage(title: string, message: string, priority: Priority): string {
  return `${PRIORITY_EMOJI[priority]} *${title}*\n${message}`;
}

/** يرسل فعلياً عبر Discord Webhook الحقيقي (متاح مباشرة من المتصفح لأن Discord يسمح CORS للـwebhooks) */
export async function sendToDiscord(webhookUrl: string, payload: object): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

/** يرسل فعلياً عبر Telegram Bot API الحقيقي */
export async function sendToTelegram(botToken: string, chatId: string, text: string): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  return { ok: res.ok, status: res.status };
}

export function TelegramDiscordAlertRelayDemo() {
  const [title, setTitle] = useState('عملية بيع جديدة! 🎉');
  const [message, setMessage] = useState('طلب جديد بقيمة 450 ج.م من العميل أحمد سامي');
  const [priority, setPriority] = useState<Priority>('info');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const discordPayload = useMemo(() => buildDiscordPayload(title, message, priority), [title, message, priority]);
  const telegramMessage = useMemo(() => buildTelegramMessage(title, message, priority), [title, message, priority]);

  const testSend = async (target: 'discord' | 'telegram') => {
    setSending(true);
    setSendResult(null);
    try {
      const result =
        target === 'discord'
          ? await sendToDiscord(discordWebhook, discordPayload)
          : await sendToTelegram(telegramToken, telegramChatId, telegramMessage);
      setSendResult(result.ok ? '✓ تم الإرسال بنجاح' : `✗ فشل الإرسال (${result.status})`);
    } catch {
      setSendResult('✗ تعذر الاتصال — تحقق من الرابط/التوكن');
    } finally {
      setSending(false);
    }
  };

  const copyPayload = async () => {
    await navigator.clipboard.writeText(JSON.stringify(discordPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Bell size={20} /> موزع تنبيهات تيليجرام وديسكورد (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">إرسال حقيقي فعلي — أدخل رابط Webhook أو توكن بوت حقيقي وجرّب الإرسال مباشرة.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <Field label="عنوان التنبيه" value={title} onChange={setTitle} />
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص الرسالة</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm h-16" />
          </div>
          <div className="flex gap-2">
            {(['info', 'warning', 'critical'] as Priority[]).map((p) => (
              <button key={p} onClick={() => setPriority(p)} className={`flex-1 text-xs font-bold px-2 py-1.5 rounded-md border ${priority === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`}>{PRIORITY_EMOJI[p]} {p}</button>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <Field label="Discord Webhook URL (اختياري للإرسال الفعلي)" value={discordWebhook} onChange={setDiscordWebhook} dir="ltr" />
            <button onClick={() => testSend('discord')} disabled={!discordWebhook || sending} className="w-full bg-indigo-600 text-white py-2 rounded-md text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
              <Send size={13} /> إرسال حقيقي لـ Discord
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Telegram Bot Token" value={telegramToken} onChange={setTelegramToken} dir="ltr" />
              <Field label="Chat ID" value={telegramChatId} onChange={setTelegramChatId} dir="ltr" />
            </div>
            <button onClick={() => testSend('telegram')} disabled={!telegramToken || !telegramChatId || sending} className="w-full bg-sky-600 text-white py-2 rounded-md text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
              <Send size={13} /> إرسال حقيقي لـ Telegram
            </button>
          </div>
          {sendResult && <p className="text-xs font-bold text-center">{sendResult}</p>}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold text-gray-600">Discord Payload</p>
              <button onClick={copyPayload} className="text-[11px] text-indigo-600 font-bold flex items-center gap-1"><Copy size={11} /> {copied ? 'تم ✓' : 'نسخ'}</button>
            </div>
            <pre dir="ltr" className="text-[10.5px] p-3 border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap h-40">{JSON.stringify(discordPayload, null, 2)}</pre>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Telegram Message Preview</p>
            <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs whitespace-pre-wrap">{telegramMessage}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" dir={dir} />
    </div>
  );
}
