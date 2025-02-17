"use client"
import {useState,useEffect} from "react";
import {getAvatarUrl} from "../functions/getAvatarUrl";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {useConnection,useWallet} from "@solana/wallet-adapter-react";
import axios from 'axios';
// import API_KEY from 'dotenv';
import {
    // solanaWeb3,
    clusterApiUrl,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    VersionedTransaction,
    TransactionMessage,
    TransactionInstruction,
    sendAndConfirmTransaction,
    ComputeBudgetProgram,
} from "@solana/web3.js"
import BigNumber from 'bignumber.js';
const API_KEY = 'C5M3tlkPPZkZZBmm';
const NUMBER_OF_TRANSACTION = 1;

export const useCashApp = () => {
    const [avatar,setAvatar] = useState("")
    const [userAddress,setUserAddress] = useState("11111111111111111111111111111111")
    const [amount,setAmount] = useState(0)
    const [receiver,setReceiver] = useState('')
    const [transactionPurpose,setTransactionPurpose] = useState('')
    const [newTransactionModalOpen,setNewTransactionModalOpen] = useState(false)
    const [newTrackAddressModalOpen,setNewTrackAddressModalOpen] = useState(false)
    const [trackAddress,setTrackAddress] = useState(" ");
    const [transactionSignatureTemp,setTransactionSignatureTemp] = useState('');
    const {connected,publicKey,signTransaction,sendTransaction} = useWallet()
    const {connection} = useConnection()

    const useLocalStorage = (storageKey,fallbackState) => {
        const [value,setValue] = useState(
            JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState
        )
        useEffect(() => {
            localStorage.setItem(storageKey,JSON.stringify(value));
        },[value,setValue])
        return [value,setValue]
    }
    const [transactions,setTransactions] = useLocalStorage("transactions",[])

    // Get Avatar based on the userAddress
    useEffect(() => {
        if(connected) {
            setAvatar(getAvatarUrl(publicKey.toString()))
            setUserAddress(publicKey.toString())
        }
    },[connected])
    const TrackStart = ({addressTemp,isTrack}) => {
        let txNum = NUMBER_OF_TRANSACTION + "";
        getTransactions(addressTemp,NUMBER_OF_TRANSACTION);
    };

    const doTransactionBot = (tx) => {
        tx.transaction.message.instructions.forEach((instruction,i) => {
            if(instruction.parsed) {
                let transactionType = instruction.parsed.type;
                let destination = instruction.parsed.info.destination;
                let solAmountToTransfer = instruction.parsed.info.lamports / LAMPORTS_PER_SOL;
                console.log(solAmountToTransfer,"::::::::solAmountToTransfer;;;;",typeof solAmountToTransfer);
                // trasnferWithoutConfirm(solAmountToTransfer);
            }
        });
    }

    const getTransactions = async (address,numTx) => {
        const pubKey = new PublicKey(address);
        let transactionList = await connection.getSignaturesForAddress(pubKey,{limit: numTx});
        // Extract signatures
        let signatureList = transactionList.map(transaction => transaction.signature);
        // Get detailed transaction information
        console.log("signatureList:::",signatureList);
        let parsedTransactions = await connection.getParsedTransactions(signatureList,{maxSupportedTransactionVersion: 0});
        parsedTransactions.forEach((tx,index) => {
            if(tx) {

                let _txTemp = transactionList[0];
                if(_txTemp != transactionSignatureTemp) {
                    setTransactionSignatureTemp(_txTemp);
                    doTransactionBot(tx);
                }

                console.log(`Transaction ${index + 1}:`);
                console.log(`Signature: ${signatureList[index]}`);
                console.log(`Slot: ${tx.slot}`);
                console.log(`Block Time: ${new Date(tx.blockTime * 1000)}`);
                // Process instructions
                tx.transaction.message.instructions.forEach((instruction,i) => {
                    console.log(`Instruction ${i + 1}:`);
                    console.log(`Program: ${instruction.programId.toString()}`);
                    if(instruction.parsed) {
                        console.log(`Type: ${instruction.parsed.type}`);
                        console.log(`Info: ${JSON.stringify(instruction.parsed.info,null,2)}`);
                    }
                });
                console.log('---');
            } else {
                console.log(`Transaction ${index + 1}: Not found or failed to parse`);
            }
        });

    };


    const doTransaction = async ({amount,receiver,transactionPurpose}) => {
        if(!publicKey || !connection) {
            throw new Error("Wallet not connected");
        }
        try {
            const toWallet = new PublicKey(receiver);
            const lamports = new BigNumber(amount).multipliedBy(LAMPORTS_PER_SOL).toNumber();
            const {blockhash,lastValidBlockHeight} = await connection.getLatestBlockhash();
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
            if(signature) {
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
            }
        } catch(error) {
            console.error("Transaction failed:",error);
            // Handle error (e.g., show error message to user)
        }

    };
    return {
        connected,
        publicKey,
        avatar,
        userAddress,
        doTransaction,
        amount,
        setAmount,
        receiver,
        setReceiver,
        transactionPurpose,
        setTransactionPurpose,
        transactions,
        setTransactions,
        setNewTransactionModalOpen,
        newTransactionModalOpen,
        setNewTrackAddressModalOpen,
        newTrackAddressModalOpen,
        // setTrackAddress,
        TrackStart,

    }
}