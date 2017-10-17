pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";

/**
 * @title RuiCoin
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract RuiCoin is StandardToken {
  using SafeMath for uint256;

  string public constant name = "RuiCoin";
  string public constant symbol = "RUI";
  uint256 public constant decimals = 18;

  uint256 public totalSupply = 5 * (uint256(10) ** decimals);
  uint256 public totalRaised; // total ether raised (in wei)

  uint256 public startTimestamp; // timestamp after which ICO will start
  uint256 public durationSeconds = 12 * 7 * 24 * 60 * 60; // 12 weeks

  uint256 public minCap; // the ICO ether goal (in wei)
  uint256 public maxCap; // the ICO ether max cap (in wei)

  /**
   * Address which will receive raised funds
   * and owns the total supply of tokens
   */
  address public fundsWallet;

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function RuiCoin(
    uint256 _startTimestamp,
    uint256 _minCap,
    uint256 _maxCap) {

    fundsWallet = msg.sender;
    startTimestamp = _startTimestamp;
    minCap = _minCap;
    maxCap = _maxCap;

    // initially assign all tokens to the fundsWallet
    balances[fundsWallet] = totalSupply;
    Transfer(0x0, fundsWallet, totalSupply);
  }

  function calculateTokenAmount(uint256 weiAmount) constant returns(uint256){
    uint256 tokenAmount = weiAmount / 100;
    return tokenAmount;
  }


  function buy() payable {
    totalRaised = totalRaised.add(msg.value);

    uint256 tokenAmount = calculateTokenAmount(msg.value);
    balances[fundsWallet] = balances[fundsWallet].sub(tokenAmount);
    balances[msg.sender] = balances[msg.sender].add(tokenAmount);
    Transfer(fundsWallet, msg.sender, tokenAmount);

    // immediately transfer ether to fundsWallet
    fundsWallet.transfer(msg.value);
  }

}
