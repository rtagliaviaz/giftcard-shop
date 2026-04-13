export interface NetworkConfigInterface {
    NAME: string;
    CHAIN_ID: number;
    RPC_URL: string;
    XPUB: string;
    RPC_WS_URL: string;
    CURRENCY_CONTRACT_ADDRESS: string & { length: 42 }; //limit the string size to 42 characters
    CURRENCY: string;
    DECIMALS: number;
}

export interface AppConfigInterface {
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


//strict interface for MySQL config
export interface MySQLConfigInterface {
    host: string | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
    port: number | undefined;
}

