const MyContract = artifacts.require("DBankVault");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract);
};