var RuiCoin = artifacts.require("./RuiCoin.sol");

// helpers
let toWei = n => n * Math.pow(10, 18);
const ethBalance = (address) => web3.eth.getBalance(address).toNumber();
const timeController = (() => {
  const addSeconds = (seconds) => new Promise((resolve, reject) =>
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [seconds],
      id: new Date().getTime()
    }, (error, result) => error ? reject(error) : resolve(result.result)));

  const addDays = (days) => addSeconds(days * 24 * 60 * 60);
  const currentTimestamp = () => web3.eth.getBlock(web3.eth.blockNumber).timestamp;

  return {
    addSeconds,
    addDays,
    currentTimestamp
  };
})();


contract('RuiCoin', function(accounts) {
  const expectedSupply = 5 * Math.pow(10, 18);
  const fundsWallet = accounts[1];
  const buyerOneWallet = accounts[2];
  const buyerTwoWallet = accounts[3];
  const buyerThreeWallet = accounts[4];

  const oneEth = toWei(1);
  const minCap = toWei(2);
  const maxCap = toWei(5);

  const createToken = () => RuiCoin.new(fundsWallet, timeController.currentTimestamp(), minCap, maxCap);

  it("should put 5 RuiCoin in the first account with 18 decimals", async function() {
    const token = await createToken();

    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), expectedSupply, 'Total supply mismatch');

    const fundsWalletBalance = await token.balanceOf(fundsWallet);
    assert.equal(fundsWalletBalance.toNumber(), expectedSupply, 'Initial funds wallet balance mismatch');

  });

  it("should send (transfer) the coin correctly", async function() {
    var meta;

    // Get initial balances of first and second account.
    var account_one = fundsWallet;
    var account_two = buyerOneWallet;

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 1;

    const token = await createToken();

    account_one_starting_balance = (await token.balanceOf.call(account_one)).toNumber();
    account_two_starting_balance = (await token.balanceOf.call(account_two)).toNumber();

    assert.equal(account_one_starting_balance, expectedSupply);
    assert.equal(account_two_starting_balance, 0);

    await token.transfer(account_two, amount, {from: account_one});

    account_one_ending_balance = (await token.balanceOf.call(account_one)).toNumber();
    account_two_ending_balance = (await token.balanceOf.call(account_two)).toNumber();

    assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Didnt remove the amount from the first account");

    assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Didnt add the amount to the second account");
    });

  it("should be able to buy tokens for the right price", async function() {
    const token = await createToken();
    const fundsWalletInitialEth = await ethBalance(fundsWallet);

    const fundsWalletBalance = await token.balanceOf(fundsWallet);
    assert.equal(fundsWalletBalance.toNumber(), expectedSupply, 'Initial funds wallet balance mismatch');


    await token.buy.sendTransaction({
      from: buyerOneWallet,
      value: oneEth,
      to: token.address
    });

    assert.equal(ethBalance(token.address), 0, 'Contract balance mismatch');
    assert.equal(ethBalance(fundsWallet), oneEth + fundsWalletInitialEth, 'Funds wallet balance mismatch');

    let tokens = (await token.balanceOf.call(buyerOneWallet)).toNumber();

    assert.equal(tokens, 0.01 * Math.pow(10, 18), "Not the right price!");

  });
});
