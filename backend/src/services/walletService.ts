// services/walletService.ts
import { HDKey } from '@scure/bip32';
import { ethers } from 'ethers';
import config from '../config';

export function generateAddressFromXpub(index: number): string {
    // Load the account xpub (depth 3: m/44'/60'/0')
    const hdNode = HDKey.fromExtendedKey(config.sepolia.SEPOLIA_XPUB);
    
    // Derive external chain (0) – non‑hardened
    const chainNode = hdNode.deriveChild(0);
    // Derive the address index – non‑hardened
    const childNode = chainNode.deriveChild(index);
    
    if (!childNode.publicKey) {
        throw new Error(`Failed to derive public key for index ${index}`);
    }
    
    const publicKeyHex = '0x' + Buffer.from(childNode.publicKey).toString('hex');
    const address = ethers.computeAddress(publicKeyHex);
    return address;
}