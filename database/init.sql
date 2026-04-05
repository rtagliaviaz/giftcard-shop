use giftcard_shop;

-- product catalog
create table if not exists gift_cards (
    id int auto_increment primary key,
    name varchar(100) not null,
    active boolean not null default true,
    created_at timestamp default current_timestamp
);

-- orders
create table if not exists orders (
  id serial primary key,
  address varchar(42) not null, -- Ethereum address generated for payment
  address_index int not null, -- index used to derive the address from the xpub (for later sweeping)
  currency varchar(10) not null, -- e.g. "USDT"
  email varchar(255) not null, -- customer email for code delivery
  status varchar(20) not null default 'pending', -- pending, paid, expired, failed
  paid_at timestamp, -- when the order was paid
  expires_at timestamp not null, -- deadline for payment (20 minutes after order creation
  whitdrawal_deadline timestamp not null, -- deadline for manual withdrawal (24 hours after order creation),
  terms_accepted boolean not null default false, -- whether the customer accepted the terms and conditions
  created_at timestamp default current_timestamp,
  swept boolean not null default false -- whether the funds have been swept to the main wallet
);

-- order items (gift cards)
create table if not exists order_items (
  id serial primary key,
  order_id BIGINT UNSIGNED NOT NULL,
  gift_card_id int not null,
  quantity int not null, -- quantity of the gift card
  unit_amount_usd int not null, -- Price per card in USD (e.g., 10 for $10)
  total_amount_usd int not null, -- Total price for this line item (quantity * unit_amount_usd)
  foreign key (order_id) references orders(id),
  foreign key (gift_card_id) references gift_cards(id)
);

-- gift card codes
create table if not exists gift_card_codes (
  id serial primary key,
  order_item_id BIGINT UNSIGNED NOT NULL,
  code varchar(255) not null, -- the actual gift card code to be delivered to the customer
  delivered boolean not null default false, -- whether the code has been delivered to the customer
  delivered_at timestamp, -- when the code was delivered
  expires_at timestamp, -- If the code itself has an expiry (optional)
  foreign key (order_item_id) references order_items(id)
);

--payment transactions (for record keeping, especially if we want to support refunds in the future)
create table if not exists payment_transactions (
  id serial primary key,
  order_id BIGINT UNSIGNED NOT NULL,
  tx_hash varchar(66) not null, -- Ethereum transaction hash
  from_address varchar(42) not null, -- address from which payment was made
  amount bigint not null, -- amount paid in smallest unit (e.g., if USDT has 6 decimals, then $10 would be 10000000)
  confrmation_count int not null, -- number of confirmations (can be updated by a background job)
  received_at timestamp default current_timestamp, -- when the payment was first detected
  foreign key (order_id) references orders(id)
);

--sweep_log (to keep track of the sweeping process)
create table if not exists sweep_log (
  id serial primary key,
  order_id BIGINT UNSIGNED NOT NULL,
  tx_hash varchar(66) not null, -- Ethereum transaction hash of the sweep
  from_address varchar(42) not null, -- address from which funds were swept
  amount bigint not null, -- amount swept in smallest unit
  swept_at timestamp default current_timestamp, -- when the sweep was executed
  foreign key (order_id) references orders(id)
);