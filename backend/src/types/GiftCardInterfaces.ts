export type GiftCardTypeResponse = {
    id: number;
    name: string;
    image: string;
    denominations: {
        id: number;
        value: number;
    }[];
};

export type GiftCardTypeInterface = {
    id: number;
    name: string;
    image: string;
    denominations: {
        id: number;
        denomination: number;
        active: boolean;
    }[];
    active: boolean;
};

export type GiftCardTypeByIdResponse = {
    id: number;
    name: string;
    image: string;
    denominations: {
        id: number;
        value: number;
    }[];
};