"use client"
import {useMemo,useState,useEffect} from 'react'
import TransactionDetailModal from './TransactionDetailModal'
import TransactionItem from './TransactionItem'
import {useCashApp} from '../../hooks/cashapp'

const TransactionsList = ({initTransactions}) => {

    const [modalOpen,setModalOpen] = useState(false)
    const [currentTransactionID,setCurrentTransactionID] = useState(null)
    const currentTransaction = useMemo(() => initTransactions.find((transaction) => transaction.id === currentTransactionID),[currentTransactionID])
    const {getTransactionsExternal} = useCashApp();
    //TODO
    const [transactions,setTransactions] = useState(initTransactions);
    useEffect(() => {
        // Function to fetch updated transactions
        const fetchUpdatedTransactions = () => {
            const transactionsExternal = getTransactionsExternal();
            setTransactions(transactionsExternal);
        }
        // Set up an interval to fetch updates every 5 seconds
        const intervalId = setInterval(fetchUpdatedTransactions,5000);
        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    },[]);
    const toggleTransactionDetailModal = (value,transactionID) => {
        setCurrentTransactionID(transactionID)
        setModalOpen(value)
    }

    return (
        <div>
            <div className="bg-[#f6f6f6] pb-4 pt-10">
                <p className="mx-auto max-w-3xl px-10 text-sm font-medium uppercase text-[#abafb2] xl:px-0">Transactions</p>
            </div>
            <div className="max-w-3xl px-10 py-4 mx-auto divide-y divide-gray-100 xl:px-0">
                {transactions.map(({id,to,amount,description,transactionDate}) => (
                    <TransactionItem key={id} id={id} to={to} description={description} transactionDate={transactionDate} amount={amount} toggleTransactionDetailModal={toggleTransactionDetailModal} />
                ))}
                <TransactionDetailModal modalOpen={modalOpen} setModalOpen={setModalOpen} currentTransaction={currentTransaction} />
            </div>
        </div>
    )
}

export default TransactionsList
