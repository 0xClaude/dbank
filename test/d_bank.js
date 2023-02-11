const DBank = artifacts.require("DBank");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("DBank", function (/* accounts */) {
  it("should assert true", async function () {
    await DBank.deployed();
    return assert.isTrue(true);
  });
});
