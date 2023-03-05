import styles from "./AdminScreen.module.css"

import { Box, Button, TextField } from "@mui/material";
import { useState, useContext } from "react";
import { Context } from "@/pages";

function AdminScreen() {
    const [addAddress, setAddAddress] = useState("");
    const [removeAddress, setRemoveAddress] = useState("");
    const { state } = useContext(Context);

    const banUser = async () => {
        if (addAddress === state.userWalletAddress) {
            return;
        }
        try {
            await state.contractInterface.methods.addBlacklist(addAddress).send({ from: state.userWalletAddress });
        } catch (error) {
            console.log(error);
        } finally {
            console.log(`Banned ${addAddress}`);
        }
    }
    const unbanUser = async () => {
        try {
            await state.contractInterface.methods.removeBlacklist(removeAddress).send({ from: state.userWalletAddress });
        } catch (error) {
            console.log(error);
        } finally {
            console.log(`Unbanned ${removeAddress}`);
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