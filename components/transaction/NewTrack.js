import {useState} from 'react'
import Modal from '../Modal'
import {useCashApp} from '../../hooks/cashapp'


const NewTrack = ({modalOpen,setModalOpen}) => {


    const {TrackStart} = useCashApp()
    // const { amount,setAmount,receiver,setReceiver,transactionPurpose, setTransactionPurpose, doTransaction} = useCashApp()
    const [addressTemp,SetAddress] = useState('');

    const onSetAddress = (e) => {
        e.preventDefault()
        const newAddress = e.target.value

        SetAddress(newAddress)

        const input = document.querySelector('input#address')
        input.style.width = newAddress.length + 'ch'
    }

    const onSetTrack = () => {
        // Pay and add transaction funcationallity goes here!
        setModalOpen(false)
        let isTrack = true;
        // await doTransaction({amount, receiver, transactionPurpose})
        // Clear states
        // setAmount(0)
        // setReceiver("")
        // setTransactionPurpose("")
        TrackStart({addressTemp,isTrack});
    }

    return (
        <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div className="relative min-w-[400] w-full flex flex-col items-center justify-center space-y-8 my-9">
                <label htmlFor="address">address</label>
                <div className="flex items-center justify-center text-center text-xl font-semibold text-[#00d54f]">
                    <input className="outline-none w-96" id="address" name="address" type="text" value={addressTemp} onChange={onSetAddress} min={0} />
                </div>
                <div className="flex w-full space-x-1">
                    <button onClick={onSetTrack} className="w-full rounded-lg bg-[#00d54f] py-3 px-12 text-white hover:bg-opacity-70">
                        setTrack
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default NewTrack
