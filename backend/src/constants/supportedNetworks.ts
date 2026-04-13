export const SUPPORTED_NETWORKS = ['sepolia', 'baseSepolia'] as const;
export type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];