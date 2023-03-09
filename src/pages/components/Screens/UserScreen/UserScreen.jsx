import styles from "./UserScreen.module.css";

import { Context } from "@/pages";
import { Box, Button, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";

function UserScreen() {

    const { state, dispatch, handleSuccess, handleError } = useContext(Context);
    const [transfers, setTransfers] = useState(null);
    const [amount, setAmount] = useState("");
    const [sendTo, setSendTo] = useState("");

    // Query the blockchain for all the transfers the user did so far
    const checkTransfers = async () => {
        setTransfers([]);
        try {
            if (!state.contractInterface) { return; }
            if (!state.userWalletAddress) { return; }
            const userTransfers = await state.contractInterface.methods.checkTransfers(state.userWalletAddress).call();
            setTransfers(userTransfers);
        } catch (error) {
            handleError(error.message);
        }
    }

    // Submit a request for a transfer
    const requestTransfer = async () => {
        try {
            if (!state.userWalletAddress) {
                handleError("Wallet not connected");
                return;
            }
            if (!sendTo) {
                handleError("Please enter Recipient");
                return;
            }

            // Send the transaction request to the blockchain
            const weiAmount = state.web3Interface.utils.toWei(String(amount));
            await state.contractInterface.methods.requestTransfer(sendTo).send({ from: state.userWalletAddress, gas: 3000000, value: weiAmount });

            // Calculate new values for the states
            const newContractBalance = Number(weiAmount) + Number(state.contractBalance);
            const newUserBalance = Number(state.userWalletBalance) - Number(weiAmount);

            dispatch({ type: "setContractBalance", payload: newContractBalance });
            dispatch({ type: "setUserWalletBalance", payload: newUserBalance });

            handleSuccess("Transfer requested, please wait for approval.");
        } catch (error) {
            handleError(error.message);
        } finally {
            setAmount("");
            setSendTo("");
        }
    }

    // Transfer the funds
    const sendTransaction = async (id) => {
        console.log(state);
        try {
            await state.contractInterface.methods.transfer(id).send({ from: state.userWalletAddress, gas: 3000000 });
        } catch (error) {
            handleError(error.message);
        }
    }

    // Cancel the transaction and withdraw funds
    const cancelTransaction = async (id) => {
        try {
            await state.contractInterface.methods.withdraw(state.userWalletAddress, id).send({ from: state.userWalletAddress, gas: 3000000 });
        } catch (error) {
            handleError(error.message);
        }
    }

    // Whenever the user changes his or her wallet, check for transfers
    useEffect(() => {
        checkTransfers();
    }, [state.userWalletAddress])

    // Listen to the "transferRequested" event to add the event
    useEffect(() => {
        let transactionRequestedListener;
        if (state.contractInterface) {
            try {
                transactionRequestedListener = state.contractInterface.events.transferRequested({}).
                    on("data", () => {
                        checkTransfers();
                    })
            } catch (error) {
                handleError(error.message);
            }
        }
        // Clean up the listener
        return () => {
            if (transactionRequestedListener) {
                transactionRequestedListener.unsubscribe();
            }
        }
    }, [state.contractInterface]);

    // Listen to the "transactionApproved Listener"
    useEffect(() => {
        let transactionApprovedListener;
        if (state.contractInterface) {
            try {
                transactionApprovedListener = state.contractInterface.events.transferApproved({}).
                    on("data", (event) => {
                        if (event.returnValues[0] === state.userWalletAddress) {
                            if (transfers) {
                                const updatedTransfers = transfers.map(previousTransfers => {
                                    if (previousTransfers[0] === event.returnValues[1]) {
                                        return [previousTransfers[0], previousTransfers[1], previousTransfers[2], "1"];
                                    } else {
                                        return previousTransfers;
                                    }
                                });
                                setTransfers(updatedTransfers);
                            }
                        }


                    })
            } catch (error) {
                handleError(error.message);
            }
        }
        // Clean up the listener
        return () => {
            if (transactionApprovedListener) {
                transactionApprovedListener.unsubscribe();
            }
        }
    }, [state.contractInterface])

    return (
        <>
            <h3>Hello, welcome to DBank v3</h3>
            <Box display="flex" alignItems="center" className={styles.transfer}>
                <TextField value={sendTo} label="Address" autoComplete="off" onChange={(e) => setSendTo(e.target.value)} />
                <TextField value={amount} label="Amount" autoComplete="off" onChange={(e) => setAmount(Number(e.target.value))} />
                <Button onClick={requestTransfer}>Request transfer</Button>
            </Box>
            {transfers && transfers.map((item) => {
                console.log(item);
                return (<div key={item[0]}>
                    <p>Transaction ID: {item[0]}</p>
                    <p>Recipient: {item[1]}</p>
                    <p>Amount: {state.web3Interface.utils.fromWei(item[2])} ETH</p>
                    {item[3] === "0" && (
                        <p>Status: Waiting for approval</p>
                    )}
                    {item[3] === "1" && (
                        <p>Status: Approved</p>
                    )}
                    {item[3] === "2" && (
                        <p>Status: Rejected</p>
                    )}
                    {item[3] === "3" && (
                        <p>Status: Transferred</p>
                    )}
                    {(item[3] !== "1") && (
                        <>
                            <Button disabled>Transfer</Button>
                        </>
                    )}
                    {item[3] === "1" && (
                        <>
                            <Button onClick={() => {
                                console.log(`Sending Transactin ID ${item[0]}`);
                                sendTransaction(item[0]);
                            }}>Transfer</Button>
                        </>
                    )
                    }
                    {(item[3] === "0" || item[3] === "1") && (
                        <>
                            <Button color="error" onClick={() => { cancelTransaction(item[0]) }}>Cancel & Withdraw</Button>
                        </>
                    )}
                    {item[3] === "2" && (
                        <>
                            <Button color="error" onClick={() => { cancelTransaction(item[0]) }}>Withdraw</Button>
                        </>
                    )}
                    {item[3] === "3" && (
                        <>
                            <Button disabled color="error">Cancel</Button>
                        </>
                    )}
                    <hr />
                </div >)
            })}
        </>
    );
}

export default UserScreen;