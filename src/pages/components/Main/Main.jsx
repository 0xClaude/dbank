import { useEffect, useReducer, useState } from "react";
import styles from "./Main.module.css";

import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { DataGrid } from '@mui/x-data-grid';
import { Avatar, Button, TextField } from "@mui/material";
import Box from '@mui/material/Box';

import { ABI, ABI2, contractAddress, vaultAddress } from "@/pages/web3/contract";
import Web3 from "web3";

const initialState = {
    address: "",
    removeAddress: "",
    banAddress: "",
    unbanAddress: "",
    removeBanAddress: "",
    sendTo: "",
    amount: "",
    withdrawAmount: 0
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
        default:
            throw new Error(`Received: ${action.type}`);
    }
}

const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
const contract = new web3.eth.Contract(ABI, contractAddress);
const vault = new web3.eth.Contract(ABI2, vaultAddress);

export default function Main(props) {

    const [state, dispatch] = useReducer(reducer, initialState);
    const [transactionlist, setTransactionlist] = useState([]);

    const checkBan = async () => {
        if (props.state.address !== undefined && props.state.address !== null) {

            await contract.methods.isBlacklisted(props.state.address).call() ? props.dispatch({ type: "setBlacklist", payload: true }) : props.dispatch({ type: "setBlacklist", payload: false });

            await contract.methods.isAdmin(props.state.address).call() ? props.dispatch({ type: "setAdmin", payload: true }) : props.dispatch({ type: "setAdmin", payload: false });

            await contract.methods.isOwner(props.state.address).call() ? props.dispatch({ type: "setOwner", payload: true }) : props.dispatch({ type: "setOwner", payload: false });
        } else {
            props.dispatch({ type: "setOwner", payload: false });
            props.dispatch({ type: "setBlacklist", payload: false });
            props.dispatch({ type: "setAdmin", payload: false });
        }
    }


    useEffect(() => {
        checkBan();
        checkContractBalance();
        checkBalance();
    }, [props.state.address]);

    useEffect(() => {
        contract.events.adminAdded().on("data", (event) => {
            console.log(event.returnValues[0]);
        }).on("error", console.error);

        contract.events.transferRequested().on("data", (event) => {
            //allAccounts();
        })
        // Cleanup
        return () => {
            contract.events.adminAdded().removeAllListeners("data");
            contract.events.adminAdded().removeAllListeners("error");

        }
    }, [props.state.connected]);



    const checkBalance = async () => {
        props.state.address !== undefined && props.dispatch({ type: "setBalance", payload: web3.utils.fromWei(await web3.eth.getBalance(props.state.address)) });
    };

    const checkContractBalance = async () => {
        props.dispatch({ type: "setContractBalance", payload: await vault.methods.getBalance().call() });
    };

    const makeAdmin = async () => {
        try {
            await contract.methods.addAdmin(state.address).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
        state.address === props.state.address && props.dispatch({ type: "setAdmin", payload: true });
    }

    const removeAdmin = async () => {
        try {
            await contract.methods.removeAdmin(state.removeAddress).send({ from: props.state.address });
        } catch (error) {
            if (error.reason) {
                console.log(`Error: ${error.reason}`);
            } else {
                console.log(`No message: ${error}`);
            }
        }
        state.removeAddress === props.state.address && props.dispatch({ type: "setAdmin", payload: false });
    }

    const addBan = async () => {
        try {
            await contract.methods.addBlacklist(state.banAddress).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
        state.banAddress === props.state.address && props.dispatch({ type: "setBlacklist", payload: true });
    }

    const removeBan = async () => {
        try {
            await contract.methods.removeBlacklist(state.unbanAddress).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
    }

    const sendEther = async (e) => {
        try {
            await contract.methods.requestTransfer(state.sendTo, web3.utils.toWei(state.amount, "ether")).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
        checkContractBalance();
        checkBalance();

    }

    const withdraw = async (e) => {
        try {
            await vault.methods.withdraw(web3.utils.toWei(state.withdrawAmount)).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
        checkContractBalance();
        checkBalance();
    }

    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "from", headerName: "From", width: 400 },
        {
            field: "to",
            headerName: "To",
            width: 400
        },
        {
            field: "Amount",
            fieldName: "AMOUNT",
            width: 90
        },
        {
            field: "Approved",
            fieldName: "APPROVED?",
            width: 90
        }
    ]





    return (
        <>
            <div className={styles.main}>
                {!props.state.loading && !props.state.connected && <p>Please connect your wallet</p>}
                {props.state.loading && <p>Please wait ...</p>}
                {props.state.blacklist && <p className={styles.banned}><RemoveCircleOutlineIcon />You are banned.</p>}
                {!props.state.loading && !props.state.blacklist && props.state.connected && (
                    <>
                        <div className={styles.welcome}>
                            <div className={styles.topwelcome}>
                                <Avatar>
                                    <AdminPanelSettingsIcon />
                                </Avatar>
                                {props.state.owner && (
                                    <p>Welcome, owner</p>
                                )}
                                {props.state.admin && !props.state.owner && (
                                    <p>Welcome, admin</p>
                                )
                                }
                                {props.state.connected && !props.state.admin && !props.state.owner && (
                                    <p>Welcome to DBank</p>
                                )}
                            </div>
                        </div>


                    </>
                )}
                {!props.state.loading && !props.state.blacklist && props.state.connected && props.state.owner && (
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
                )}
                {!props.state.loading && !props.state.blacklist && props.state.connected && props.state.admin || props.state.owner && (
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
                )}


            </div>
            {props.state.connected && !props.state.blacklist && (
                <div className={styles.transaction}>
                    <h3>Send a transaction</h3>
                    <TextField label="To" variant="standard" onChange={(e) => dispatch({ type: "addSendTo", payload: e.target.value })} />
                    <TextField label="Amount" variant="standard" onChange={(e) => dispatch({ type: "addAmount", payload: e.target.value })} />
                    <Button onClick={sendEther}>Send</Button>
                </div>
            )}

            {props.state.connected && !props.state.blacklist && props.state.owner && (
                <div className={styles.transaction}>
                    <h3>Withdraw from contract</h3>
                    <h4>Balance: {web3.utils.fromWei(String(props.state.contractBalance))} Ether</h4>
                    <TextField label="Amount" variant="standard" onChange={(e) => dispatch({ type: "addWithdrawAmount", payload: e.target.value })} />
                    <Button onClick={withdraw}>Withdraw</Button>
                </div>
            )}
            <hr />
            <div className={styles.transaction}>
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
    )
}