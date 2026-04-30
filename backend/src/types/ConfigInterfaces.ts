export interface NetworkConfigInterface {
    NAME: string;
    CHAIN_ID: number;
    RPC_URL: string;
    XPUB: string;
    RPC_WS_URL: string;
    CURRENCY_CONTRACT_ADDRESS: string & { length: 42 };
    CURRENCY: string;
    DECIMALS: number;
}

export interface AppConfigInterface {
    email: {
        host: string | undefined;
        port: number | undefined;
        secure: boolean | undefined;
        auth: {
            user: string | undefined;
            pass: string | undefined;
        };
        from: string | undefined;
    },
    networks: {
        sepolia: NetworkConfigInterface;
        baseSepolia: NetworkConfigInterface;
    };
    port: string | undefined;
    clientUrl: string | undefined;
    mysql: {
        giftcardShopDb: MySQLConfigInterface;
    }
}

export type NetworkName = 'sepolia' | 'baseSepolia';


export interface MySQLConfigInterface {
    host: string | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
    port: number | undefined;
}

