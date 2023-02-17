import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { DataGrid } from '@mui/x-data-grid';

import { Avatar, Button, TextField } from "@mui/material";
import Box from '@mui/material/Box';
import { useEffect, useRef, useState } from "react";
import styles from "./Main.module.css";

import { ABI, ABI2, contractAddress, vaultAddress } from "@/pages/web3/contract";
import Web3 from "web3";

export default function Main(props) {

    const addAddress = useRef(null);
    const removeAddress = useRef(null);
    const banAddress = useRef(null);
    const sendTo = useRef(null);
    const amount = useRef(null);
    const withdrawAmount = useRef(null);
    const unbanAddress = useRef(null);

    const [transactionlist, setTransactionlist] = useState([]);


    const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
    const contract = new web3.eth.Contract(ABI, contractAddress);
    const vault = new web3.eth.Contract(ABI2, vaultAddress);

    useEffect(() => {
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
        checkBan();
        checkContractBalance();
        checkBalance();
    }, [props.state.address]);

    useEffect(() => {
        contract.events.adminAdded().on("data", (event) => {
            console.log(event.returnValues[0]);
        }).on("error", console.error);
        contract.events.transferRequested().on("data", (event) => {
            allAcccounts();
        })
        allAcccounts();
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
            await contract.methods.addAdmin(addAddress.current.value).send({ from: address });
        } catch (error) {
            console.log(error);
        }
        addAddress.current.value === props.state.address && props.dispatch({ type: "setAdmin", payload: true });
    }

    const removeAdmin = async () => {
        try {
            await contract.methods.removeAdmin(removeAddress.current.value).send({ from: props.state.address });
        } catch (error) {
            if (error.reason) {
                console.log(`Error: ${error.reason}`);
            } else {
                console.log(`No message: ${error}`);
            }
        }
        removeAddress.current.value === props.state.address && props.dispatch({ type: "setAdmin", payload: false });
    }

    const addBan = async () => {
        try {
            await contract.methods.addBlacklist(banAddress.current.value).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
        banAddress.current.value === props.state.address && props.dispatch({ type: "setBlacklist", payload: true });
    }

    const removeBan = async () => {
        try {
            await contract.methods.removeBlacklist(unbanAddress.current.value).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
    }

    const sendEther = async (e) => {
        try {
            await contract.methods.requestTransfer(sendTo.current.value, web3.utils.toWei(amount.current.value, "ether")).send({ from: props.state.address });
        } catch (error) {
            console.log(error);
        }
        checkContractBalance();
        checkBalance();

    }

    const withdraw = async (e) => {
        try {
            await vault.methods.withdraw(web3.utils.toWei(withdrawAmount.current.value)).send({ from: props.state.address });
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



    const allAcccounts = async () => {
        setTransactionlist([]);
        try {
            const accounts = await web3.eth.getAccounts()
            accounts.map(async (item, index) => {
                console.log(`Checking for account ${item}`)
                let transactions = await contract.methods.checkTransfers(item).call();
                transactions.length > 0 && transactions.map((txItem, txIndex) => {
                    let transaction = {
                        id: txIndex,
                        from: item,
                        to: txItem[0],
                        amount: web3.utils.fromWei(String(txItem[1])),
                        approved: txItem[2]
                    }
                    setTransactionlist((previous) => [...previous, transaction]);
                })
            })
        } catch (error) {
            console.error(error);
        }
    }

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
                            <TextField label="Address" variant="standard" inputRef={addAddress} />
                            <Button onClick={makeAdmin}>Add admin</Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={removeAddress} />
                            <Button onClick={removeAdmin}>Remove admin</Button>
                        </Box>
                    </div>
                )}
                {!props.state.loading && !props.state.blacklist && props.state.connected && props.state.admin || props.state.owner && (
                    <div className={styles.topwelcome}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={banAddress} />
                            <Button onClick={addBan}>Ban user</Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            <TextField label="Address" variant="standard" inputRef={unbanAddress} />
                            <Button onClick={removeBan}>Unban user</Button>
                        </Box>
                    </div>
                )}


            </div>
            {props.state.connected && !props.state.blacklist && (
                <div className={styles.transaction}>
                    <h3>Send a transaction</h3>
                    <TextField label="To" variant="standard" inputRef={sendTo} />
                    <TextField label="Amount" variant="standard" inputRef={amount} />
                    <Button onClick={sendEther}>Send</Button>
                </div>
            )}

            {props.state.connected && !props.state.blacklist && props.state.owner && (
                <div className={styles.transaction}>
                    <h3>Withdraw from contract</h3>
                    <h4>Balance: {web3.utils.fromWei(String(props.state.contractBalance))} Ether</h4>
                    <TextField label="Amount" variant="standard" inputRef={withdrawAmount} />
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