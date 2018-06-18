#!/bin/sh

set -e

export PGPASSWORD="MswMfPSs"

# select tablename from pg_tables where schemaname = 'public' and tableowner = 'proxyuser';

psql -U proxyuser -h 127.0.0.1 -p 3399 jeffrey <<EOF
DROP TABLE
  knex_migrations,
  knex_migrations_lock,
  access_tokens,
  pending_users,
  stripe_cards,
  product_prices,
  invoices,
  invoice_items,
  reset_password_tokens,
  login_tokens,
  products,
  apple_ios_receipts,
  messages,
  conversations,
  conversation_participants,
  countries,
  postal_addresses,
  businesses,
  user_devices,
  tos_acceptances,
  phone_number_verification_codes,
  reviews,
  user_documents,
  stripe_accounts,
  provider_prices,
  users,
  service_categories,
  missions
CASCADE
EOF
