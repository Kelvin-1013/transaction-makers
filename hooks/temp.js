const doTransaction = async ({amount,receiver,transactionPurpose}) => {
    if(!publicKey || !connection) {
        throw new Error("Wallet not connected");
    }
    try {
        const toWallet = new PublicKey(receiver);
        const lamports = new BigNumber(amount).multipliedBy(LAMPORTS_PER_SOL).toNumber();
        const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({units: 300000});
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({microLamports: 1});
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toWallet,
            lamports: lamports
        });
        const message = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: [modifyComputeUnits,addPriorityFee,transferInstruction]
        }).compileToV0Message();
        const transaction = new VersionedTransaction(message);
        const signedTransaction = await signTransaction(transaction);
        const signature = await sendAndConfirmTransaction(
            connection,
            signedTransaction,{
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            confirmation: 'confirmed',
            maxRetries: 5
        }
        );
        console.log("Transaction confirmed. Signature:",signature);
        // Update your UI or state here
    } catch(error) {
        console.error("Transaction failed:",error);
        // Handle error (e.g., show error message to user)
    }

    const newID = (transactions.length + 1).toString()
    const NewTransaction = {
        id: newID,
        from: {
            name: publicKey,
            handle: publicKey,
            avatar: avatar,
            verified: true,
        },
        to: {
            name: receiver,
            handle: '-',
            avatar: getAvatarUrl(receiver.toString()),
            verified: false,
        },
        description: transactionPurpose,
        transactionDate: new Date(),
        status: 'Completed',
        amount: amount,
        source: '-',
        identifier: '-'
    };
    setNewTransactionModalOpen(false)
    setTransactions([NewTransaction,...transactions])

};