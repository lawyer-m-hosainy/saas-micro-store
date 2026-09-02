import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/** يحدد قائمة إيميلات الأدمن المسموح لها من متغير البيئة ADMIN_EMAILS (مفصولة بفواصل) */
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/** يُستخدم بعد requireAuth للتأكد إن المستخدم المسجل دخوله ضمن قائمة إيميلات الأدمن، وليس مجرد مستخدم مسجل دخوله */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};
