import { eq, and, ilike } from 'drizzle-orm';
import { db } from '../db';
import { users, purchases } from '../db/schema';
import { products as catalogProducts } from '../data.js';
import { buildProductZipBuffer } from './deliverableZip';
import { sendOrderDeliveryEmail } from './mailer';

export interface CompletedOrder {
  id: string;
  productId: string;
  productTitle: string;
  buyerName: string;
  buyerEmail: string;
  amountEgp: number;
}

/**
 * يُستدعى لما الأدمن يأكد طلب كـ"مكتمل": يربط الشراء بمكتبة المشتري لو عنده حساب بنفس الإيميل،
 * وبيبعت الكود المصدري الحقيقي كملف ZIP بالإيميل. أي خطوة تفشل بتتسجل في اللوج ومتوقفش الطلب.
 */
export async function fulfillCompletedOrder(order: CompletedOrder): Promise<void> {
  try {
    const [matchedUser] = await db.select().from(users).where(ilike(users.email, order.buyerEmail)).limit(1);
    if (matchedUser) {
      const [existing] = await db.select().from(purchases)
        .where(and(eq(purchases.userId, matchedUser.id), eq(purchases.productId, order.productId)))
        .limit(1);
      if (!existing) {
        await db.insert(purchases).values({
          userId: matchedUser.id,
          productId: order.productId,
          amount: order.amountEgp,
          currency: 'EGP',
        });
      }
    }
  } catch (error) {
    console.error('Failed to link purchase to user library:', error);
  }

  const product = catalogProducts.find((p) => p.id === order.productId);
  if (!product) return;

  try {
    const zipBuffer = await buildProductZipBuffer(product);
    const safeId = product.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    await sendOrderDeliveryEmail({
      to: order.buyerEmail,
      buyerName: order.buyerName,
      productTitle: order.productTitle,
      orderId: order.id,
      zipBuffer,
      zipFileName: `${safeId}-full-package.zip`,
    });
  } catch (error) {
    console.error('Failed to send order delivery email:', error);
  }
}
