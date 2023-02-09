export const connectWeb = async () => {
    if (window.ethereum) {
        const connection = await window.ethereum.request({method: "eth_requestAccounts"});
        return connection;
    }
};