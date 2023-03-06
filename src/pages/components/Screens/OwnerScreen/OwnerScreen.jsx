import styles from "./OwnerScreen.module.css"

import { Box, Button, TextField } from "@mui/material";
import { useState, useContext } from "react";
import { Context } from "@/pages";

function OwnerScreen() {
    const [addAddress, setAddAddress] = useState("");
    const [removeAddress, setRemoveAddress] = useState("");
    const { state, dispatch, handleSuccess, handleError } = useContext(Context);

    const addAdmin = async () => {
        try {
            await state.contractInterface.methods.addAdmin(addAddress).send({ from: state.userWalletAddress });
            handleSuccess(`Added ${addAddress} as admin`);
            if (addAddress === state.userWalletAddress) {
                dispatch({ type: "setUserIsAdmin", payload: true });
            }
        } catch (error) {
            handleError(error.message);
        } finally {

            setAddAddress("");
        }
    }

    const removeAdmin = async () => {
        try {
            await state.contractInterface.methods.removeAdmin(removeAddress).send({ from: state.userWalletAddress });
            handleSuccess(`Removed ${removeAddress} as admin`);
            if (removeAddress === state.userWalletAddress) {
                dispatch({ type: "setUserIsAdmin", payload: false });
            }
        } catch (error) {
            handleError(error.message);
        } finally {
            setRemoveAddress("");
        }
    }

    return (
        <>
            <div className={styles.ownerpanel}>
                <h3>Welcome, owner</h3>
                <div>
                    <Box display="flex" alignItems="center">
                        <TextField value={addAddress} label="Address" autoComplete="off" onChange={(e) => setAddAddress(e.target.value)} />
                        <Button onClick={addAdmin}>Add Admin</Button>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <TextField value={removeAddress} label="Address" autoComplete="off" onChange={(e) => setRemoveAddress(e.target.value)} />
                        <Button onClick={removeAdmin}>Remove Admin</Button>
                    </Box>
                </div>
            </div>

        </>
    )
}

export default OwnerScreen;