export interface SepoliaConfigInterface {
    SEPOLIA_RPC_URL: string;
    SEPOLIA_RPC_WS_URL: string;
    SEPOLIA_XPUB: string;
    SEPOLIA_MOCK_USDT_ADDRESS: string & { length: 42 }; //limit the string size to 42 characters
};

//strict interface for MySQL config
export interface MySQLConfigInterface {
    host: string | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
    port: number | undefined;
}