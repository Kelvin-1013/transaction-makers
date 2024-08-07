const web3 = require('@solana/web3.js');
const BigNumber = require('bignumber.js');

const doTransaction = async ({ amount, receiver, transactionPurpose, knownSigner }) => {
    if (!knownSigner || !connection) {
        throw new Error("Signer or connection not provided");
    }

    try {
        const toWallet = new web3.PublicKey(receiver);
        const lamports = new BigNumber(amount).multipliedBy(web3.LAMPORTS_PER_SOL).toNumber();
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 });
        const addPriorityFee = web3.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 });
        const transferInstruction = web3.SystemProgram.transfer({
            fromPubkey: knownSigner.publicKey,
            toPubkey: toWallet,
            lamports: lamports
        });

        const message = new web3.TransactionMessage({
            payerKey: knownSigner.publicKey,
            recentBlockhash: blockhash,
            instructions: [modifyComputeUnits, addPriorityFee, transferInstruction]
        }).compileToV0Message();

        const transaction = new web3.VersionedTransaction(message);

        // Sign the transaction with the known signer
        transaction.sign([knownSigner]);

        // Send and confirm the transaction
        const signature = await connection.sendTransaction(transaction, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 5
        });

        await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
        });

        console.log("Transaction confirmed. Signature:", signature);

        // Update transactions list (assuming these variables are in scope)
        const newID = (transactions.length + 1).toString();
        const NewTransaction = {
            id: newID,
            from: {
                name: knownSigner.publicKey.toString(),
                handle: knownSigner.publicKey.toString(),
                avatar: avatar, // Ensure this variable is defined
                verified: true,
            },
            to: {
                name: receiver,
                handle: '-',
                avatar: getAvatarUrl(receiver.toString()), // Ensure this function is defined
                verified: false,
            },
            description: transactionPurpose,
            transactionDate: new Date(),
            status: 'Completed',
            amount: amount,
            source: '-',
            identifier: '-'
        };

        setNewTransactionModalOpen(false); // Ensure this function is defined
        setTransactions([NewTransaction, ...transactions]); // Ensure this function is defined

    } catch (error) {
        console.error("Transaction failed:", error);
        // Handle error (e.g., show error message to user)
    }
};