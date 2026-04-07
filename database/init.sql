use giftcard_shop;

-- gift_cards table
create table if not exists gift_cards (
    id int auto_increment primary key,
    name varchar(100) not null,    -- e.g., "Steam Gift Card"
    denomination decimal(10,2) not null, -- e.g., 5.00, 10.00, 20.00
    active boolean not null default true,
    created_at timestamp default current_timestamp,
    unique key (name, denomination) -- prevent duplicates
);


--populate gift_cards with some initial data
insert into gift_cards (name, denomination) values
('Steam Gift Card', 5.00),
('Steam Gift Card', 10.00),
('Steam Gift Card', 20.00),
('Steam Gift Card', 50.00),
('Steam Gift Card', 100.00),
('Amazon Gift Card', 10.00),
('Amazon Gift Card', 25.00),
('Amazon Gift Card', 50.00),
('Eneba Gift Card', 10.00),
('Eneba Gift Card', 25.00),
('Eneba Gift Card', 50.00);

-- Inventory now directly per gift card (which already includes denomination)
create table if not exists gift_card_inventory (
    id int auto_increment primary key,
    gift_card_id int not null,
    quantity int not null,  -- available stock for that specific denomination
    foreign key (gift_card_id) references gift_cards(id)
);


-- populate inventory with some initial stock (e.g., 10 cards of each type)
insert into gift_card_inventory (gift_card_id, quantity)
select id, 10 from gift_cards;

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
    code varchar(255) not null unique,
    gift_card_id int not null,            -- references gift_cards(id) which includes denomination
    order_item_id bigint unsigned null,   -- null when code is still in pool
    delivered_at timestamp null,          -- when assigned to an order
    expires_at timestamp null,            -- optional code expiry
    foreign key (gift_card_id) references gift_cards(id),
    foreign key (order_item_id) references order_items(id)
);

--populate gift_card_codes with some dummy codes for testing (e.g., 10 codes per gift card type)
insert into gift_card_codes (code, gift_card_id)
select concat(g.name, '_', g.denomination, '_CODE_', LPAD(FLOOR(RAND() * 1000000), 6, '0')), g.id
from gift_cards g;




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