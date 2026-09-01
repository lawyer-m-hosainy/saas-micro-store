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
  stripeSessionId: text('stripe_session_id'),
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
