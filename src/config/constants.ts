// ============================================
// Centralized Configuration Constants
// All hardcoded values consolidated here
// ============================================

// === Contact & Support ===
export const SUPPORT_PHONE = '01142099605';
export const WHATSAPP_NUMBER = '201142099605'; // International format (Egypt +20)
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// === Currency & Pricing ===
// المتجر يسعّر بالجنيه المصري فقط. product.price لسه مخزن كرقم أساسي داخلي
// بيتحول لسعر جنيه نفسي (xx9) عن طريق EGP_RATE — مش سعر صرف حقيقي، مجرد أداة تسعير.
export const EGP_RATE = 15;
export const MIN_EGP_PRICE = 199;

// رسوم التركيب السحابي = نسبة من سعر المنتج بدل رقم ثابت، عشان متبقاش أغلى من المنتج نفسه
export const DEPLOYMENT_FEE_PERCENT = 0.4;
export const MIN_DEPLOYMENT_FEE_EGP = 250;

export function getDeploymentFeeEgp(productPriceEgp: number): number {
  const withFloor = Math.max(MIN_DEPLOYMENT_FEE_EGP, Math.round((productPriceEgp * DEPLOYMENT_FEE_PERCENT) / 10) * 10);
  // لا تتجاوز رسوم التركيب سعر المنتج نفسه أبدًا
  return Math.min(withFloor, productPriceEgp);
}

// === Order ID Generation ===
export const ORDER_PREFIX = '#ORD-';

// === Pagination ===
export const PRODUCTS_PER_PAGE = 12;
export const ADMIN_PRODUCTS_PER_PAGE = 50;

// === External Links ===
export const STORE_NAME = 'Micro SaaS Store';
export const STORE_DOMAIN = 'microsaasstore.com';
