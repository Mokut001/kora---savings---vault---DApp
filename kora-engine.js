import { Lucid, Blockfrost, Data } from "lucid-cardano";

/**
 * KORA SAVINGS ENGINE (Off-Chain)
 * Enforces savings discipline via Haskell-validated locks.
 */
export class KoraVaultEngine {
    constructor() {
        this.lucid = null;
    }

    async bootstrap() {
        // Initialize for Cardano Mainnet
        const bfKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY || "mainnet_YOUR_BLOCKFROST_KEY";
        this.lucid = await Lucid.new(
            new Blockfrost("https://cardano-mainnet.blockfrost.io/api/v0", bfKey),
            "Mainnet"
        );
        return this.lucid;
    }

    async connect() {
        if (!this.lucid) await this.bootstrap();
        const api = await window.cardano.nami.enable();
        this.lucid.selectWallet(api);
        return await this.lucid.wallet.address();
    }

    /**
     * Create a new Vault (Initial Deposit)
     * @param {number} targetAmount - Target ADA to lock toward
     * @param {string} label - Goal Title (e.g., "New House")
     */
    async createVault(targetAmount, label) {
        const pkh = this.lucid.utils.getAddressDetails(
            await this.lucid.wallet.address()
        ).paymentCredential.hash;

        // Datum: saver, target, label (Matches Haskell script expectations)
        const datum = Data.to({
            vdSaver: pkh,
            vdTarget: BigInt(targetAmount * 1000000), // convert to lovelace
            vdLabel: Buffer.from(label).toString("hex")
        });

        const tx = await this.lucid.newTx()
            .payToContract("addr1YOUR_HASKELL_SCRIPT_ADDRESS_HERE", { inline: datum }, { lovelace: 10000000n })
            .complete();

        const signed = await tx.sign().complete();
        const txHash = await signed.submit();
        return txHash;
    }

    /**
     * Withdraw tokens once the target is met
     */
    async withdraw(utxo) {
        const tx = await this.lucid.newTx()
            .collectFrom([utxo], Data.void()) // Withdraw Action (Matches Haskell () redeemer)
            .addSigner(await this.lucid.wallet.address())
            .complete();

        const signed = await tx.sign().complete();
        return await signed.submit();
    }
}

export const kora = new KoraVaultEngine();