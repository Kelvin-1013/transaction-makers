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
    ComputeBudgetProgram
} from "@solana/web3.js"
import BigNumber from 'bignumber.js';
const API_KEY = 'C5M3tlkPPZkZZBmm';
const NUMBER_OF_TRANSACTION = 5;

export const useCashApp = () => {
    const [avatar,setAvatar] = useState("")
    const [userAddress,setUserAddress] = useState("11111111111111111111111111111111")
    const [amount,setAmount] = useState(0)
    const [receiver,setReceiver] = useState('')
    const [transactionPurpose,setTransactionPurpose] = useState('')
    const [newTransactionModalOpen,setNewTransactionModalOpen] = useState(false)
    const [newTrackAddressModalOpen,setNewTrackAddressModalOpen] = useState(false)
    const [trackAddress,setTrackAddress] = useState(" ");
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
        // setTrackAddress(addressTemp);
        // alert(trackAddress);
        let txNum = NUMBER_OF_TRANSACTION + "";
        // getTransactions(addressTemp,txNum);
        // getTransactions(addressTemp,NUMBER_OF_TRANSACTION);
        getTransactionHistory(addressTemp,NUMBER_OF_TRANSACTION);
    };
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve,ms));

    async function getTransactionWithRetry(signature,maxRetries = 5) {
        for(let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await connection.getParsedTransaction(signature);
            } catch(error) {
                if(error.message.includes('429')) {
                    const delay = Math.pow(2,attempt) * 1000;
                    console.log(`Rate limited. Retrying after ${delay}ms...`);
                    await sleep(delay);
                } else {
                    throw error;
                }
            }
        }
        throw new Error('Max retries reached');
    }

    // Function to get transaction history
    async function getTransactionHistory(address,limit = 10) {
        try {
            const publicKey = new PublicKey(address);
            const signatures = await connection.getSignaturesForAddress(publicKey,{limit});
            const transactions = [];
            for(const sig of signatures) {
                try {
                    const tx = await getTransactionWithRetry(sig.signature);
                    if(tx) {
                        transactions.push(tx);
                    }
                } catch(error) {
                    console.error(`Error fetching transaction ${sig.signature}:`,error);
                }

                // Add a small delay between requests to avoid overwhelming the RPC
                await sleep(100);
            }
            return transactions;
        } catch(error) {
            console.error('Error fetching transaction history:',error);
            throw error;
        }
    }

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