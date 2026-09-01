import 'dotenv/config';
import { db } from './src/db/index.js';
import { coupons } from './src/db/schema.js';

async function seed() {
  try {
    await db.insert(coupons).values({
      code: 'DISCOUNT20',
      discountPercent: 20,
      isActive: 1,
    });
    console.log('Coupon DISCOUNT20 added successfully!');
  } catch (error) {
    if (error.code === '23505') {
      console.log('Coupon DISCOUNT20 already exists.');
    } else {
      console.error(error);
    }
  }
  process.exit(0);
}
seed();
