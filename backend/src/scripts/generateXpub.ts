import bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import dotenv from 'dotenv';
dotenv.config();


(async () => {
  const rawMnemonic = process.env.WALLET_MNEMONIC;
  if (!rawMnemonic) {
    console.error("MNEMONIC environment variable is not set.");
    process.exit(1);
  }
  const mnemonic = rawMnemonic.trim();

  let seed;
  try {
    seed = await bip39.mnemonicToSeed(mnemonic);
  } catch (error) {
    console.error("Failed to convert mnemonic to seed:", (error as Error).message);
    process.exit(1);
  }

  const master = HDKey.fromMasterSeed(seed);

  const accountNode = master.derive("m/44'/60'/0'");
  const accountXpub = accountNode.publicExtendedKey;
  console.log("✅ Account xpub:", accountXpub);

})();