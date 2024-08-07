const makeTransaction = async (fromWallet,toWallet,amount,reference) => {
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)
    const {blockhash} = await connection.getLatestBlockhash('finalized')
    const transaction = new Transaction();
    // Sign the transaction
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = blockhash;
    const transferInstuction = SystemProgram.transfer({
        fromPubkey: fromWallet,
        lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
        toPubkey: toWallet,
    })
    transferInstuction.keys.push({
        pubkey: reference,
        isSigner: false,
        isWritable: false,
    })
    transaction.add(transferInstuction)
    return transaction
}