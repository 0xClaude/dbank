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
            console.log(`Trying to send ${amount} to ${sendTo}`);
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

    useEffect(() => {
        checkTransfers();
    },[state.userWalletAddress])

    return (
        <>
            <h3>Hello, welcome to DBank v3</h3>
            <Box display="flex" alignItems="center" className={styles.transfer}>
                <TextField label="Address" autoComplete="off" onChange={(e) => setSendTo(e.target.value)} />
                <TextField label="Amount" autoComplete="off" onChange={(e) => setAmount(Number(e.target.value))} />
                <Button onClick={requestTransfer}>Request transfer</Button>
            </Box>
            {transfers !== null && transfers.map((item, index) => {
                return <div key={index}>
                    <p>Transaction ID: {item[0]}</p>
                    <p>Send it to: {item[1]}</p>
                    <p>Amount: {item[2]}</p>
                    <p>Approved? {item[3] ? "True" : "False"}</p>
                    </div>
            })}
        </>
    );
}

export default UserScreen;