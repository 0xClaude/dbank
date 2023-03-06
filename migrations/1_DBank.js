const MyContract = artifacts.require("DBank");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract);
};