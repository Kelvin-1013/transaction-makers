const web3 = require('@solana/web3.js');

(async () => {
  const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));
  const publicKey = new web3.PublicKey('YourPublicKeyHere');
  const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
  const signatureList = signatures.map(sig => sig.signature);

  let parsedTransactions = await connection.getParsedTransactions(signatureList, {
    maxSupportedTransactionVersion: 0
  });

  parsedTransactions.forEach((tx, index) => {
    if (tx) {
      console.log(`Transaction ${index + 1}:`);
      console.log(`Signature: ${signatureList[index]}`);
      console.log(`Slot: ${tx.slot}`);
      console.log(`Block Time: ${new Date(tx.blockTime * 1000)}`);

      tx.transaction.message.instructions.forEach((instruction, i) => {
        console.log(`  Instruction ${i + 1}:`);
        console.log(`    Program: ${instruction.programId.toString()}`);
        
        if (instruction.parsed) {
          console.log(`    Type: ${instruction.parsed.type}`);
          
          switch (instruction.parsed.type) {
            case 'transfer':
              console.log(`    From: ${instruction.parsed.info.source}`);
              console.log(`    To: ${instruction.parsed.info.destination}`);
              console.log(`    Amount: ${instruction.parsed.info.lamports} lamports`);
              break;

            case 'createAccount':
              console.log(`    New Account: ${instruction.parsed.info.newAccount}`);
              console.log(`    Funding Account: ${instruction.parsed.info.source}`);
              console.log(`    Lamports: ${instruction.parsed.info.lamports}`);
              console.log(`    Space: ${instruction.parsed.info.space} bytes`);
              console.log(`    Owner: ${instruction.parsed.info.owner}`);
              break;

            case 'closeAccount':
              console.log(`    Account to Close: ${instruction.parsed.info.account}`);
              console.log(`    Destination: ${instruction.parsed.info.destination}`);
              break;

            case 'approve':
              console.log(`    Source: ${instruction.parsed.info.source}`);
              console.log(`    Delegate: ${instruction.parsed.info.delegate}`);
              console.log(`    Amount: ${instruction.parsed.info.amount}`);
              break;

            default:
              Object.entries(instruction.parsed.info).forEach(([key, value]) => {
                console.log(`    ${key}: ${value}`);
              });
          }
        } else {
          console.log('    Instruction data not parsed');
        }
      });

      console.log('---');
    } else {
      console.log(`Transaction ${index + 1}: Not found or failed to parse`);
    }
  });
})();