import nodemailer, { Transporter } from 'nodemailer';

function getTransport(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export interface OrderDeliveryEmail {
  to: string;
  buyerName: string;
  productTitle: string;
  orderId: string;
  zipBuffer: Buffer;
  zipFileName: string;
}

/** يبعت إيميل تسليم حقيقي بالكود المصدري مرفق — بيرجع false بهدوء لو SMTP مش مظبوط بدل ما يفشل الطلب */
export async function sendOrderDeliveryEmail(params: OrderDeliveryEmail): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.log(`SMTP not configured — skipping delivery email for order ${params.orderId}`);
    return false;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: params.to,
    subject: `تم تفعيل طلبك ${params.orderId} — ${params.productTitle}`,
    text: `مرحباً ${params.buyerName}،

تم تأكيد استلام تحويلك وتفعيل طلبك رقم ${params.orderId} لشراء "${params.productTitle}".

هتلاقي الكود المصدري كاملاً وترخيص الاستخدام التجاري مرفقين في هذا الإيميل (ملف ZIP).

شكراً لثقتك بنا!`,
    attachments: [{ filename: params.zipFileName, content: params.zipBuffer }],
  });
  return true;
}
