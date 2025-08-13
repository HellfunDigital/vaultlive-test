
ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN stripe_payment_intent_id TEXT;
