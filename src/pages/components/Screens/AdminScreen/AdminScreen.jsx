import styles from "./AdminScreen.module.css"

import { Box, Button, TextField } from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { Context } from "@/pages";

function AdminScreen() {
    const [addAddress, setAddAddress] = useState("");
    const [removeAddress, setRemoveAddress] = useState("");
    const [transactionsEvents, setTransactionEvents] = useState(null);
    const { state, handleSuccess, handleError } = useContext(Context);

    // Banning a user and handling errors
    const banUser = async () => {
        try {
            await state.contractInterface.methods.addBlacklist(addAddress).send({ from: state.userWalletAddress });
            handleSuccess(`Banned the user.`);
        } catch (error) {
            handleError(error.message);
        } finally {
            setAddAddress("");
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
            setRemoveAddress("");
        }
    }

    // Getting all the transfer requests from the blockchain
    const getPastTransactionRequestEvents = async () => {
        setTransactionEvents([]);
        try {
            if (!state.contractInterface || !state.userWalletAddress || !state.userIsAdmin) { return; }

            // We first get ALL the requests, then we get the approved requests and subtract them from the first list
            const transferRequests = await state.contractInterface.getPastEvents("transferRequested", { fromBlock: 0, toBlock: "latest" });
            const transferApprovals = await state.contractInterface.getPastEvents("transferApproved", { fromBlock: 0, toBlock: "latest" });
            const transferRejected = await state.contractInterface.getPastEvents("transferRejected", { fromBlock: 0, toBlock: "latest" });
            const transferCancelled = await state.contractInterface.getPastEvents("transferCancelled", { fromBlock: 0, toBlock: "latest" });

            // Filtering out all the requests which have alrady been approved
            const filteredRequests = transferRequests.filter(requests => {
                const approveddRequests = transferApprovals.some(approvals => approvals.returnValues[1] === requests.returnValues[0]);
                const rejectedRequests = transferRejected.some(rejected => rejected.returnValues[1] === requests.returnValues[0]);
                const cancelledRequests = transferCancelled.some(cancelled => cancelled.returnValues[1] === requests.returnValues[0]);
                return !approveddRequests && !rejectedRequests && !cancelledRequests;
            });
            setTransactionEvents(filteredRequests);
        } catch (error) {
            handleError(error.message);
        }
    }

    // Approve a transaction
    const approveTransaction = async (from, id) => {
        try {
            await state.contractInterface.methods.approveTransfer(from, id).send({ from: state.userWalletAddress });
            setTransactionEvents(previous => {
                return previous.filter(event => event.returnValues[0] !== id);
            });
            handleSuccess("Transaction approved");
        } catch (error) {
            handleError(error.message);
        }
    }

    // Reject a transaction
    const rejectTransaction = async (from, id) => {
        try {
            await state.contractInterface.methods.rejectTransfer(from, id).send({ from: state.userWalletAddress });
            setTransactionEvents(previous => {
                return previous.filter(event => event.returnValues[0] !== id);
            });
            handleSuccess("Transaction rejected");
        } catch (error) {
            handleError(error.message);
        }
    }

    // log all transactionsEvents upon loading
    useEffect(() => {
        getPastTransactionRequestEvents();
    }, []);

    // Listen to the "transferRequested" event
    useEffect(() => {
        let transferRequestedListener;
        if (state.contractInterface) {
            try {
                transferRequestedListener = state.contractInterface.events.transferRequested({}).
                    on("data", (event) => {
                        getPastTransactionRequestEvents();
                    });
            } catch (error) {
                handleError(error.message);
            }
        }
    }, [])

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
                <div className={styles.center}>
                    <h3>Transfer requests awaiting approval:</h3>
                    {transactionsEvents && transactionsEvents
                        .map((item) => {
                            return <div key={item.returnValues[0]}>
                                <p>id: {item.returnValues[0]}</p>
                                <p>From: {item.returnValues[1]}</p>
                                <p>To: {item.returnValues[2]}</p>
                                <p>Amount: {state.web3Interface.utils.fromWei(item.returnValues[3])}</p>
                                <Button variant="outlined" onClick={() => approveTransaction(item.returnValues[1], item.returnValues[0])}>Approve</Button>
                                <Button variant="outlined" onClick={() => rejectTransaction(item.returnValues[1], item.returnValues[0])} color="error">Reject</Button>
                                <hr />
                            </div>
                        })}
                    {transactionsEvents && transactionsEvents.length === 0 && (
                        <p>No transactions found.</p>
                    )}
                </div>
            </div >
        </>
    )
}

export default AdminScreen;