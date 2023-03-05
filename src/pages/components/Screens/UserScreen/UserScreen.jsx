import styles from "./UserScreen.module.css"

import { Context } from "@/pages";
import { Box, TextField, Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";

function UserScreen() {

    const { state, dispatch } = useContext(Context);
    const [transfers, setTransfers] = useState(null);
    const [amount, setAmount] = useState(undefined);
    const [sendTo, setSendTo] = useState(undefined);

    const checkTransfers = async () => {
        setTransfers([]);
        try {
            if (!state.contractInterface) { return; }
            if (!state.userWalletAddress) { return; }
            const userTransfers = await state.contractInterface.methods.checkTransfers(state.userWalletAddress).call();
            setTransfers(userTransfers);
        } catch (error) {
            console.log(error);
        }
    }

    const requestTransfer = async () => {
        try {
            if (!state.userWalletAddress) { return; }
            if (!sendTo) { return; }
            await state.contractInterface.methods.requestTransfer(sendTo, amount).send({ from: state.userWalletAddress, gas: 3000000 });
        } catch (error) {
            console.log(error);
        } finally {
            setAmount(undefined);
            setSendTo(undefined);
        }
    }
    // Whenever the user changes his or her wallet, check for the transfers (s)he requested
    useEffect(() => {
        checkTransfers();
    }, [state.userWalletAddress])

    useEffect(() => {
        if (state.contractInterface) {
            try {
                state.contractInterface.events.transferRequested({}).
                    on("data", (event) => {
                        const newTransaction = [event.returnValues[0], event.returnValues[2], event.returnValues[3], event.returnValues[4]]
                        setTransfers((previous) => {
                            return [...previous, newTransaction];
                        });
                    })
            } catch (error) {
                console.log(error);
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
            {transfers !== null && transfers !== undefined && transfers.map((item, index) => {
                return (<div key={index}>
                    <p>Transaction ID: {item[0]}</p>
                    <p>Send it to: {item[1]}</p>
                    <p>Amount: {item[2]}</p>
                    {item[3] && (<p>Approve the transaction!</p>)}
                    <hr />
                </div>)
            })}
        </>
    );
}

export default UserScreen;