export interface SepoliaConfigInterface {
    SEPOLIA_RPC_URL: string;
    SEPOLIA_XPUB: string;
    SEPOLIA_MOCK_USDT_ADDRESS: string;
};

//strict interface for MySQL config
export interface MySQLConfigInterface {
    host: string | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
    port: number | undefined;
}