import styles from "./AdminScreen.module.css"

import { Box, Button, TextField } from "@mui/material";
import { useState, useContext } from "react";
import { Context } from "@/pages";

function AdminScreen() {
    const [addAddress, setAddAddress] = useState("");
    const [removeAddress, setRemoveAddress] = useState("");
    const [transactions, setTransactions] = useState(null);
    const { state, handleSuccess, handleError } = useContext(Context);

    // Banning a user and handling errors
    const banUser = async () => {
        if (addAddress === state.userWalletAddress) {
            return;
        }
        try {
            await state.contractInterface.methods.addBlacklist(addAddress).send({ from: state.userWalletAddress });
            handleSuccess(`Banned the user.`);
        } catch (error) {
            handleError(error.message);
        } finally {
            setAddAddress(null);
        }
    }

    // Unbanning a user and handling errors
    const unbanUser = async () => {
        try {
            await state.contractInterface.methods.removeBlacklist(removeAddress).send({ from: state.userWalletAddress });
            handleSuccess(`Unbanned the user`);
        } catch (error) {
            handleError(error.message);
        } finally {
            setRemoveAddress(null);
        }
    }

    // Getting all the transactions on the blockchain
    const getAllTransactions = () => {
        setTransactions([]);
        try {
            if (!state.contractInterface || !state.userWalletAddress || !state.userIsAdmin) { return; }
        } catch (error) {
            handleError(error.message);
        }
    }

    return (
        <>
            <div className={styles.adminpanel}>
                <h3>Welcome, admin</h3>
                <div>
                    <Box display="flex" alignItems="center">
                        <TextField label="Address" value={addAddress} autoComplete="off" onChange={(e) => setAddAddress(e.target.value)} />
                        <Button onClick={banUser}>Ban User</Button>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <TextField label="Address" value={removeAddress} autoComplete="off" onChange={(e) => setRemoveAddress(e.target.value)} />
                        <Button onClick={unbanUser}>Unban User</Button>
                    </Box>
                </div>
            </div>
        </>
    )
}

export default AdminScreen;