let Web3 = require('web3')
let contract = require('truffle-contract');

let abi = require('../build/contracts/RuiCoin.json');

let Contract, account;
const contractAddr = '0x6abed88f50227a71f56090d0f44051c7307a984d';

const toWei = eth => eth * Math.pow(10, 18);

function runner(){
  let mmWeb3 = window.web3;
  let web3 = new Web3(mmWeb3.currentProvider)
  Contract = contract(abi);
  Contract.setProvider(mmWeb3.currentProvider);

  web3.eth.getAccounts().then(acc => {
    account = acc[0];
    let btn = document.querySelector('[data-hook=buy]');
    let qtyInput = document.querySelector('[data-hook=qty]');
    let result = document.querySelector('[data-hook=response]');

    btn.addEventListener('click', () => {
      Contract.at(contractAddr).then(contract => {
        return contract.buy.sendTransaction({value: toWei(parseFloat(qtyInput.value)), to: contractAddr, from: account});
      }).then(response => {
        result.textContent = 'Transaction good! Id: ' + response;
        console.log(response)
      }).catch(e => {
        result.textContent = 'Transaction error: ' + e;
        console.log(e);
      })
    })

  });
}


window.onload = runner;
