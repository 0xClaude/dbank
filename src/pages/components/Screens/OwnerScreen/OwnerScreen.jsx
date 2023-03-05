import styles from "./OwnerScreen.module.css"

import { Box, Button, TextField } from "@mui/material";
import { useState, useContext } from "react";
import { Context } from "@/pages";

function OwnerScreen() {
    const [addAddress, setAddAddress] = useState("");
    const [removeAddress, setRemoveAddress] = useState("");
    const { state, dispatch } = useContext(Context);

    const addAdmin = async () => {
        try {
            state.contractInterface.methods.addAdmin(addAddress).send({ from: state.userWalletAddress });
        } catch (error) {
            console.log(error);
        }
        if (addAddress === state.userWalletAddress) {
            dispatch({ type: "setUserIsOwner", payload: true });
        }
    }
    const removeAdmin = async () => {
        try {
            state.contractInterface.methods.removeAdmin(removeAddress).send({ from: state.userWalletAddress });
        } catch (error) {
            console.log(error);
        } finally {
            console.log(`Removed ${removeAddress} as admin`);
        }

    }

    return (
        <>
            <div className={styles.ownerpanel}>
                <h3>Welcome, owner</h3>
                <div>
                    <Box display="flex" alignItems="center">
                        <TextField label="Address" value={addAddress} autoComplete="off" onChange={(e) => setAddAddress(e.target.value)} />
                        <Button onClick={addAdmin}>Add Admin</Button>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <TextField label="Address" value={removeAddress} autoComplete="off" onChange={(e) => setRemoveAddress(e.target.value)} />
                        <Button onClick={removeAdmin}>Remove Admin</Button>
                    </Box>
                </div>
            </div>

        </>
    )
}

export default OwnerScreen;