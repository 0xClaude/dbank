import { useEffect, useReducer } from "react";
import styles from "./Main.module.css";

import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { DataGrid } from '@mui/x-data-grid';
import { Avatar, Button, TextField } from "@mui/material";
import Box from '@mui/material/Box';
import WelcomeScreen from "../Screens/Screens";

const initialState = {
    address: null,
    removeAddress: null,
    banAddress: null,
    unbanAddress: null,
    removeBanAddress: null,
    sendTo: null,
    amount: null,
    withdrawAmount: 0,
    sendAmount: 0,
    sendAddress: null,
    addressAmount: 0
}

const reducer = (state, action) => {
    switch (action.type) {
        case "addAddress":
            return { ...state, address: action.payload };
        case "addRemoveAddress":
            return { ...state, removeAddress: action.payload };
        case "addBanAddress":
            return { ...state, banAddress: action.payload };
        case "addUnbanAddress":
            return { ...state, removeBanAddress: action.payload };
        case "addSendTo":
            return { ...state, sendTo: action.payload };
        case "addAmount":
            return { ...state, amount: action.payload };
        case "addWithdrawAmount":
            return { ...state, withdrawAmount: action.payload };
        case "addSendAmount":
            return { ...state, sendAmount: action.payload };
        case "addSendAddress":
            return { ...state, sendAddress: action.payload };
        case "addAddressAmount":
            return { ...state, addressAmount: action.payload };
        default:
            throw new Error(`Received: ${action.type}`);
    }
}

export default function Main({ state, dispatch, transactionlist }) {

    const [mainState, mainDispatch] = useReducer(reducer, initialState)

    const checkBan = async () => {
        if (state.address !== undefined && state.address !== null) {

            await web3state.contractInterface.methods.isBlacklisted(state.address).call() ? dispatch({ type: "setBlacklist", payload: true }) : dispatch({ type: "setBlacklist", payload: false });

            await web3state.contractInterface.methods.isAdmin(state.address).call() ? dispatch({ type: "setAdmin", payload: true }) : dispatch({ type: "setAdmin", payload: false });

            await web3state.contractInterface.methods.isOwner(state.address).call() ? dispatch({ type: "setOwner", payload: true }) : dispatch({ type: "setOwner", payload: false });
        } else {
            mainDispatch({ type: "setOwner", payload: false });
            mainDispatch({ type: "setBlacklist", payload: false });
            mainDispatch({ type: "setAdmin", payload: false });
        }
    }

    useEffect(() => {
        console.log(state)
    }, [state])

    useEffect(() => {
        checkBan();
        checkContractBalance();
        checkBalance();
    }, [state.address]);


    const checkBalance = async () => {
        state.address !== undefined && state.address !== "0x0" && dispatch({ type: "setBalance", payload: web3state.web3.utils.fromWei(await web3state.web3.eth.getBalance(state.address)) });
    };

    const checkContractBalance = async () => {
        dispatch({ type: "setContractBalance", payload: await web3state.vault.methods.getBalance().call() });
    };

    const makeAdmin = async () => {
        try {
            await web3state.contract.methods.addAdmin(state.address).send({ from: state.address });
        } catch (error) {
            console.log(error);
        }
        state.address === state.address && mainDispatch({ type: "setAdmin", payload: true });
    }

    const removeAdmin = async () => {
        try {
            await state.contract.methods.removeAdmin(state.removeAddress).send({ from: state.address });
        } catch (error) {
            if (error.reason) {
                console.log(`Error: ${error.reason}`);
            } else {
                console.log(`No message: ${error}`);
            }
        }
        state.removeAddress === state.address && mainDispatch({ type: "setAdmin", payload: false });
    }

    const addBan = async () => {
        try {
            await web3state.contract.methods.addBlacklist(state.banAddress).send({ from: state.address });
        } catch (error) {
            console.log(error);
        }
        state.banAddress === state.address && dispatch({ type: "setBlacklist", payload: true });
    }

    const removeBan = async () => {
        try {
            await web3state.contract.methods.removeBlacklist(state.unbanAddress).send({ from: state.address });
        } catch (error) {
            console.log(error);
        }
    }

    const sendEther = async (e) => {
        try {
            await web3state.contract.methods.requestTransfer(state.sendTo, web3state.web3.utils.toWei(state.amount, "ether")).send({ from: state.address, gas: "1000000" });
        } catch (error) {
            console.log(error);
        }
        checkContractBalance();
        checkBalance();

    }

    const withdraw = async (e) => {
        try {
            await web3state.vault.methods.withdraw(web3state.web3.utils.toWei(state.withdrawAmount)).send({ from: state.address });
        } catch (error) {
            console.log(error);
        }
        checkContractBalance();
        checkBalance();
    }

    const sendToContract = async (e) => {
        const transaction = {
            from: state.address,
            to: web3state.vaultAddress,
            value: web3.utils.toWei(state.sendAmount),
            gasPrice: 0
        }
        try {
            await web3.eth.sendTransaction(transaction, (error, result) => {
                if (error) { console.log(error); }
                else {
                    console.log("Ether sent");
                    dispatch({ type: "setBalance", payload: state.balance - state.sendAmount });
                    dispatch({ type: "setContractBalance", payload: Number(state.contractBalance) + Number(web3.utils.toWei(state.sendAmount)) });
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    const sendToUser = async (e) => {
        try {
            await vault.methods.send(web3.utils.toWei(state.addressAmount), state.sendAddress).send({ from: state.address });
            dispatch({ type: "setContractBalance", payload: Number(state.contractBalance) - Number(web3.utils.toWei(state.addressAmount)) });
            state.sendAddress === state.address && (
                dispatch({ type: "setBalance", payload: Number(state.balance) + Number(web3.utils.toWei(state.addressAmount)) })
            )
        } catch (error) {
            console.log(error);
        }
    }

    const columns = [
        { field: "id", headerName: "ID", width: 30 },
        { field: "from", fieldName: "From", width: 300 },
        {
            field: "to",
            fieldName: "To",
            width: 300
        },
        {
            field: "amount",
            fieldName: "AMOUNT",
            width: 90
        },
        {
            field: "approved",
            fieldName: "APPROVED?",
            width: 90
        }
    ]




    return (
        <>
            <div className={styles.main}>
                <WelcomeScreen value={{ isLoading, isConnected, blacklist, owner, admin }} />
                {!state.loading && !state.blacklist && state.connected && state.owner && (
                    <>
                        <div className={styles.topwelcome}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                                <TextField label="Address" variant="standard" onChange={(e) => { dispatch({ type: "addAddress", payload: e.target.value }) }} />
                                <Button onClick={makeAdmin}>Add admin</Button>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                                <TextField label="Address" variant="standard" onChange={(e) => dispatch({ type: "addRemoveAddress", payload: e.target.value })} />
                                <Button onClick={removeAdmin}>Remove admin</Button>
                            </Box>
                        </div>

                    </>
                )}
                {!state.loading && !state.blacklist && state.connected && state.owner || state.admin && (
                    <>
                        <div className={styles.topwelcome}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                                <TextField label="Address" variant="standard" onChange={(e) => dispatch({ type: "addBanAddress", payload: e.target.value })} />
                                <Button onClick={addBan}>Ban user</Button>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                                <TextField label="Address" variant="standard" onChange={(e) => dispatch({ type: "addUnbanAddress", payload: e.target.value })} />
                                <Button onClick={removeBan}>Unban user</Button>
                            </Box>
                        </div>
                        <hr />
                    </>
                )}


            </div>
            {state.connected && !state.blacklist && (
                <div className={styles.transaction}>
                    <h3>Send a transaction</h3>
                    <TextField label="To" variant="standard" onChange={(e) => dispatch({ type: "addSendTo", payload: e.target.value })} />
                    <TextField label="Amount" variant="standard" onChange={(e) => dispatch({ type: "addAmount", payload: e.target.value })} />
                    <Button onClick={sendEther}>Send</Button>
                </div>
            )}

            {state.connected && !state.blacklist && state.owner && (
                <>
                    <div className={styles.transaction}>
                        <div>
                            <h4>Balance: {web3.utils.fromWei(String(state.contractBalance))} Ether</h4>
                        </div>
                    </div>
                    <div className={styles.transaction}>
                        <div>
                            <h3>Withdraw from contract</h3>

                            <TextField label="Amount" variant="standard" onChange={(e) => dispatch({ type: "addWithdrawAmount", payload: e.target.value })} />
                            <Button onClick={withdraw}>Withdraw</Button>
                        </div>
                        <div>
                            <h3>Send to contract</h3>
                            <TextField label="Amount" variant="standard" onChange={(e) => dispatch({ type: "addSendAmount", payload: e.target.value })} />
                            <Button onClick={sendToContract}>Send</Button>
                        </div>
                    </div>
                    <div>
                        <div className={styles.transaction}>
                            <h3>Send to Address</h3>
                            <TextField label="Address" variant="standard" onChange={(e) => dispatch({ type: "addSendAddress", payload: e.target.value })} />
                            <TextField label="Amount" variant="standard" onChange={(e) => dispatch({ type: "addAddressAmount", payload: e.target.value })} />
                            <Button onClick={sendToUser}>Send to user</Button>
                        </div>
                    </div>
                </>
            )}
            {state.connected && !state.blacklist && (
                <>
                    <hr />
                    <div className={styles.transactionlist}>
                        <h3>Transactions</h3>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={transactionlist}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10]}
                                checkboxSelection
                                disableSelectionOnClick
                                experimentalFeatures={{ newEditingApi: true }}
                            />
                        </Box>
                    </div>
                </>
            )}

        </>
    )
}