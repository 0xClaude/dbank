import styles from "./UserScreen.module.css";

import { Context } from "@/pages";
import { Box, Button, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";

function UserScreen() {

    const { state, handleSuccess, handleError } = useContext(Context);
    const [transfers, setTransfers] = useState(null);
    const [amount, setAmount] = useState(undefined);
    const [sendTo, setSendTo] = useState(undefined);
    
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
            await state.contractInterface.methods.requestTransfer(sendTo, amount).send({ from: state.userWalletAddress, gas: 3000000 });
            handleSuccess("Transfer requested, please wait for approval.")
        } catch (error) {
            handleError(error.message);
        } finally {
            setAmount(undefined);
            setSendTo(undefined);
        }
    }
    // Whenever the user changes his or her wallet, check for the transfers (s)he requested
    useEffect(() => {
        checkTransfers();
    }, [state.userWalletAddress])

    // Listen for Events emitted by the smart contract
    useEffect(() => {
        if (state.contractInterface) {
            try {
                state.contractInterface.events.transferRequested({}).
                    on("data", (event) => {
                        const newTransaction = [event.returnValues[0], event.returnValues[2], event.returnValues[3], event.returnValues[4]];
                        handleSuccess("Transfer requested");
                        setTransfers((previous) => {
                            return [...previous, newTransaction];
                        });
                    })
            } catch (error) {
                handleError(error.message);
            }
        }
    }, [state.contractInterface]);


    return (
        <>
            <h3>Hello, welcome to DBank v3</h3>
            <Box display="flex" alignItems="center" className={styles.transfer}>
                <TextField label="Address" autoComplete="off" onChange={(e) => setSendTo(e.target.value)} />
                <TextField label="Amount" autoComplete="off" onChange={(e) => setAmount(Number(e.target.value))} />
                <Button onClick={requestTransfer}>Request transfer</Button>
            </Box>
            {transfers && transfers.map((item, index) => {
                return (<div key={index}>
                    <p>Transaction ID: {item[0]}</p>
                    <p>Recipient: {item[1]}</p>
                    <p>Amount: {item[2]} ETH</p>
                    {!item[3] && <p>Waiting for approval</p>}
                    {!item[4] && item[3] && <p>Transfer</p>}
                    <hr />
                </div>)
            })}
        </>
    );
}

export default UserScreen;