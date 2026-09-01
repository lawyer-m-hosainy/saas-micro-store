import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// Needs index creation via migration:
// CREATE INDEX IF NOT EXISTS user_id_idx ON purchases (user_id);
// CREATE INDEX IF NOT EXISTS product_id_idx ON purchases (product_id);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  productId: text('product_id').notNull(),
  amount: integer('amount'),
  currency: text('currency'),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  productId: text('product_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountPercent: integer('discount_percent').notNull(),
  isActive: integer('is_active').default(1).notNull(), // SQLite/PG cross compatible boolean (1=true, 0=false)
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
