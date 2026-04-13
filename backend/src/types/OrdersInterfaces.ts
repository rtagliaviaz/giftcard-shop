export interface OrderItem {
    giftCardId: number;
    quantity: number;
    unitAmountUSD: number; // price per card in USD
    // totalAmount is computed as unitAmountUSD * quantity
}


export interface Order {
    id: number;
    address: string;
    paid: boolean;
    expectedAmount: bigint;      // in smallest unit (e.g., 6 decimals for USDT)
    email: string;
    items: OrderItem[];
    expiresAt: Date;
}

