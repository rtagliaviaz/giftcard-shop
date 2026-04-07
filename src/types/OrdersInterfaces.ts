export interface OrderItem {
    giftCardId: number;
    quantity: number;
    unitAmountUsd: number;
    totalAmountUsd: number;
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

