import { describe, expect, it, vi, afterEach } from 'vitest';
import { buildDiscordPayload, buildTelegramMessage, sendToDiscord, sendToTelegram } from './TelegramDiscordAlertRelay';

describe('buildDiscordPayload', () => {
  it('embeds the title and message with a timestamp', () => {
    const payload = buildDiscordPayload('New Sale', 'Order #123', 'info') as any;
    expect(payload.embeds[0].title).toContain('New Sale');
    expect(payload.embeds[0].description).toBe('Order #123');
    expect(payload.embeds[0].timestamp).toBeDefined();
  });

  it('uses a different embed color per priority', () => {
    const info = buildDiscordPayload('T', 'M', 'info') as any;
    const critical = buildDiscordPayload('T', 'M', 'critical') as any;
    expect(info.embeds[0].color).not.toBe(critical.embeds[0].color);
  });

  it('adds an @here mention only for critical priority', () => {
    const info = buildDiscordPayload('T', 'M', 'info') as any;
    const critical = buildDiscordPayload('T', 'M', 'critical') as any;
    expect(info.content).toBeUndefined();
    expect(critical.content).toBe('@here');
  });
});

describe('buildTelegramMessage', () => {
  it('includes the title in bold markdown and the message text', () => {
    const text = buildTelegramMessage('New Sale', 'Order #123', 'warning');
    expect(text).toContain('*New Sale*');
    expect(text).toContain('Order #123');
  });

  it('prefixes with a different emoji per priority', () => {
    const info = buildTelegramMessage('T', 'M', 'info');
    const critical = buildTelegramMessage('T', 'M', 'critical');
    expect(info.startsWith('ℹ️')).toBe(true);
    expect(critical.startsWith('🚨')).toBe(true);
  });
});

describe('sendToDiscord / sendToTelegram', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the payload as JSON to the given Discord webhook URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendToDiscord('https://discord.com/api/webhooks/x/y', { content: 'hi' });

    expect(fetchMock).toHaveBeenCalledWith('https://discord.com/api/webhooks/x/y', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'hi' }),
    }));
    expect(result).toEqual({ ok: true, status: 204 });
  });

  it('posts to the correct Telegram Bot API sendMessage URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await sendToTelegram('TOKEN123', '999', 'hello');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.telegram.org/botTOKEN123/sendMessage');
    expect(JSON.parse(options.body)).toEqual({ chat_id: '999', text: 'hello', parse_mode: 'Markdown' });
  });

  it('reports a failed send when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const result = await sendToDiscord('https://discord.com/api/webhooks/x/y', {});
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });
});
