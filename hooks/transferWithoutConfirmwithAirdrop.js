const web3 = require('@solana/web3.js');
const nacl = require('tweetnacl');

// Establish a connection to the Solana network
const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

// Generate keypairs for the sender and receiver
const sender = web3.Keypair.generate();
const receiver = web3.Keypair.generate();

// Airdrop SOL to the sender for transaction fees (only for devnet)
const airdropSignature = await connection.requestAirdrop(sender.publicKey, web3.LAMPORTS_PER_SOL);
await connection.confirmTransaction(airdropSignature);

// Create a new transaction
let transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver.publicKey,
        lamports: web3.LAMPORTS_PER_SOL / 100, // Amount to send (0.01 SOL)
    })
);

// Get the latest blockhash
let { blockhash } = await connection.getLatestBlockhash();
transaction.recentBlockhash = blockhash;
transaction.feePayer = sender.publicKey;

// Sign the transaction
transaction.sign(sender);

// Serialize the transaction
const serializedTransaction = transaction.serialize();

// Send the serialized transaction
const txid = await connection.sendRawTransaction(serializedTransaction, {
    skipPreflight: true,
    maxRetries: 2,
});

// Confirm the transaction
await connection.confirmTransaction(txid, 'confirmed');

console.log('Transaction successful with ID:', txid);