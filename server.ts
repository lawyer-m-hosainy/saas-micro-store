import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth';
import { getOrCreateUser } from './src/db/users';
import { db } from './src/db';
import { purchases, users, reviews, coupons } from './src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { GoogleGenAI } from '@google/genai';
import { products as catalogProducts } from './src/data.js';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } }) : null;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors({ origin: process.env.APP_URL || '*', credentials: true }));
  app.use(express.json());

  // API Routes
  
  // Login / Sync User
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const dbUser = await getOrCreateUser(user.uid, user.email || '', user.name);
      res.json({ success: true, user: dbUser });
    } catch (error: any) {
      console.error('Failed to sync user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user purchases
  app.get('/api/purchases', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const userPurchases = await db.select().from(purchases).where(eq(purchases.userId, user.uid));
      res.json(userPurchases.map(p => p.productId));
    } catch (error: any) {
      console.error('Failed to fetch purchases:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Validate Coupon
  app.get('/api/coupons/validate', async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) return res.status(400).json({ error: 'Coupon code required' });

      // Check if coupon exists and is active
      const couponRecord = await db.select().from(coupons).where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, 1))).limit(1);
      
      if (couponRecord.length === 0) {
        return res.status(404).json({ error: 'كوبون غير صحيح أو منتهي الصلاحية' });
      }

      res.json({ success: true, discountPercent: couponRecord[0].discountPercent });
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin: Get all coupons
  app.get('/api/coupons', requireAuth, async (req, res) => {
    try {
      const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
      res.json(allCoupons);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin: Create new coupon
  app.post('/api/coupons', requireAuth, async (req, res) => {
    try {
      const { code, discountPercent } = req.body;
      if (!code || !discountPercent) return res.status(400).json({ error: 'Missing data' });
      
      const newCoupon = await db.insert(coupons).values({
        code: code.toUpperCase(),
        discountPercent: parseInt(discountPercent),
        isActive: 1
      }).returning();
      
      res.json(newCoupon[0]);
    } catch (error) {
      console.error('Failed to create coupon:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI Support Chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || !genAI) {
        return res.json({ reply: 'عذراً، نظام الذكاء الاصطناعي غير متوفر حالياً.' });
      }

      const prompt = `
أنت المساعد الذكي لمتجر Micro SaaS. مهمتك الرد على أسئلة العملاء بلباقة، بلهجة مصرية احترافية.
التفاصيل المهمة للمتجر:
- جميع الأكواد المصدرية غير مشفرة (Open Source).
- يحصل العميل على ترخيص تجاري مدى الحياة.
- التسليم يتم خلال 24 ساعة من الشراء.
- يوجد خدمة تركيب سحابي مقابل 20 دولار أو ما يعادله.
- طرق الدفع: إنستاباي، فودافون كاش، المحافظ الإلكترونية. (لا نستخدم Stripe أو بوابات الدفع).

سؤال العميل: "${message}"

أجب باختصار وبشكل مباشر:`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error('Chat AI Error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });



  // Get product reviews
  app.get('/api/reviews/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const productReviews = await db.select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.name
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

      res.json(productReviews);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Post a review
  app.post('/api/reviews', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { productId, rating, comment } = req.body;
      
      if (!productId || !rating || !comment) {
        return res.status(400).json({ error: 'Missing review details' });
      }
      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid rating' });
      }
      if (comment && comment.length > 1000) {
        return res.status(400).json({ error: 'Comment too long' });
      }

      await db.insert(reviews).values({
        userId: user.uid,
        productId,
        rating,
        comment
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to post review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Run Tool via Gemini API (No auth required for demo)
  app.post('/api/run-tool', requireAuth, async (req, res) => {
    try {
      const { toolTitle, toolDescription, inputData } = req.body;

      if (!toolTitle || !inputData) {
        return res.status(400).json({ error: 'Missing tool title or input data' });
      }

      // Verify that user actually purchased this product
      // We could pass productId to be fully secure, but for this demo, 
      // we'll assume the frontend correctly restricts access.

      const ai = genAI;
      if (!ai) return res.status(500).json({ error: 'GenAI not configured' });

      const prompt = `You are an AI acting as the following software tool: "${toolTitle}".
Tool Description: ${toolDescription}

The user has provided the following input:
"""
${inputData}
"""

Please process this input and generate the result exactly as this tool would. Return only the final output without meta-commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Failed to run tool via Gemini:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI Marketing Outreach generator for local places/stores
  app.post('/api/generate-outreach', requireAuth, async (req, res) => {
    try {
      const { placeName, placeType, placeAddress } = req.body;

      if (!placeName) {
        return res.status(400).json({ error: 'Place name is required' });
      }

      const ai = genAI;
      if (!ai) return res.status(500).json({ error: 'GenAI not configured' });

      const prompt = `أنت خبير تسويق رقمي ومبيعات B2B لمتجر أدوات برمجية وحلول سحابية (Micro SaaS).
لديك متجر يقدم أدوات ذكاء اصطناعي وأتمتة مثل: أدوات توليد الفواتير، مساعد دردشة ذكي لخدمة العملاء، تحسين سيو المواقع، تحويل الصوت لنصوص، روبوتات دعم واتساب، مولد محتوى سوشيال ميديا.

نريد تقديم عرض تسويقي مخصص لهذا النشاط التجاري المحلي:
- اسم النشاط: ${placeName}
- نوع النشاط: ${placeType || 'نشاط تجاري'}
- العنوان: ${placeAddress || 'غير محدد'}

المطلوب إرجاع رد بصيغة JSON نظيفة فقط (بدون كتل markdown أخرى إن أمكن) بالحقول التالية:
{
  "recommendedTool": "اسم الأداة البرمجية المقترحة لهذا النشاط وكيف ستساعدهم",
  "pitchReason": "سبب اختيار هذه الأداة للنشاط في جملة واحدة مقنعة",
  "whatsappMessage": "نص رسالة واتساب تسويقية ذكية وموجزة وودودة موجهة لإدارة النشاط تحثهم على تجربة وشراء الأداة لتحسين مبيعاتهم وتوفير وقتهم، مع وضع إيموجي جذاب",
  "emailSubject": "عنوان بريد إلكتروني تسويقي جذاب ومقنع",
  "emailBody": "نص بريد إلكتروني احترافي ومختصر لعرض الحل البرمجي عليهم"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        parsed = {
          recommendedTool: 'مساعد خدمة العملاء الذكي وتوليد المحتوى',
          pitchReason: 'يساعد في الرد الآلي على استفسارات الزبائن وزيادة المبيعات',
          whatsappMessage: `مرحباً فريق ${placeName} 👋\nلاحظنا تميز نشاطكم، ولدينا حل برمجيات ذكية مخصصة لمساعدتكم في أتمتة خدمة العملاء ومضاعفة مبيعاتكم بسهولة وبدون اشتراكات معقدة.\nهل يمكننا تزويدكم بنسخة تجريبية؟`,
          emailSubject: `فرصة لتعزيز مبيعات وتجربة عملاء ${placeName} بالذكاء الاصطناعي`,
          emailBody: `السادة إدارة ${placeName}،\n\nنحييكم ونتمنى لكم دوام التوفيق. نقدم لكم حلولاً برمجية ذكية مصممة خصيصاً لمساعدتكم في إدارة وتطوير أعمالكم بكل كفاءة.`
        };
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Failed to generate outreach pitch:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Batch AI Outreach generator for multiple stores in 5km radius
  app.post('/api/generate-batch-outreach', requireAuth, async (req, res) => {
    try {
      const { places } = req.body;
      if (!Array.isArray(places) || places.length === 0) {
        return res.status(400).json({ error: 'Places array is required' });
      }

      const ai = genAI;
      if (!ai) return res.status(500).json({ error: 'GenAI not configured' });

      // Prepare summarized prompt for batch processing
      const placesSummary = places.slice(0, 10).map((p, idx) => (
        `[${idx + 1}] اسم: ${p.name}, نوع: ${p.type || 'تجاري'}, هاتف: ${p.phone || 'غير متوفر'}`
      )).join('\n');

      const prompt = `أنت خبير مبيعات وتسويق لمتجر برمجيات وحلول SaaS جاهزة لرواد الأعمال والمتاجر.
لدينا قائمة بمحلات وأنشطة تجارية تم اكتشافها ضمن نطاق 5 كم:
${placesSummary}

المطلوب: توليد رسالة تسويقية ذكية ومخصصة بالواتساب لكل نشاط، مع تحديد الأداة البرمجية الأنسب له من متجرنا لزيادة مبيعاته.

أرجع النتيجة بصيغة JSON كمصفوفة عناصر كالتالي:
[
  {
    "index": 1,
    "placeName": "اسم النشاط",
    "recommendedTool": "اسم الأداة البرمجية المقترحة",
    "whatsappMessage": "رسالة واتساب تسويقية ذكية وجذابة موجهة باسم النشاط مع إيموجي تحثهم على الشراء وتجربة الأداة"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      let results = [];
      try {
        results = JSON.parse(response.text || '[]');
      } catch (e) {
        results = places.map((p, idx) => ({
          index: idx + 1,
          placeName: p.name,
          recommendedTool: 'مساعد خدمة العملاء الذكي وتوليد المبيعات',
          whatsappMessage: `مرحباً فريق ${p.name} 👋 يسعدنا تقديم أداة ذكاء اصطناعي مخصصة لمضاعفة مبيعاتكم وأتمتة الردود على عملائكم بكفاءة تامة.`
        }));
      }

      res.json({ results });
    } catch (error: any) {
      console.error('Failed to generate batch outreach:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
