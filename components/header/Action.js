const Action = ({setModalOpen,setAddressModalOpen}) => {
    const onNewTransaction = () => {
        setModalOpen(true)
    }

    return (
        <div>
            <button onClick={() => setAddressModalOpen(true)}
                className="w-full  rounded-lg bg-[black] py-3 hover:bg-opacity-70 my-10" >
                <span className="font-medium text-white" > setTrack </span>
            </button>
            <button onClick={onNewTransaction}
                className="w-full rounded-lg bg-[black] py-3 hover:bg-opacity-70" >
                <span className="font-medium text-white" > New </span>
            </button>
        </div>
    )
}

export default Action