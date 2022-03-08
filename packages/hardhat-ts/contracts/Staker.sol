pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

// import "./IterableMapping.sol";

contract Staker {
  // using IterableMapping for IterableMapping.Map;

  ExampleExternalContract public exampleExternalContract;

  mapping(address => uint256) public balances;
  // IterableMapping.Map private balancesMap;

  uint256 public constant threshold = 0.1 ether;
  uint256 public deadline = block.timestamp + 72 hours;
  bool public openForWithdraw = false;
  bool public locked;

  constructor(address exampleExternalContractAddress) public {
    exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

  // EVENTS
  event Stake(address staker, uint256 value);
  event Complete(uint256 amount);
  event Withdraw(address _to, uint256 value);

  // MODIFIERS

  modifier notCompleted() {
    require(!locked, "Not Completed!");
    locked = true;
    _;
    locked = false;
  }

  // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
  //  ( make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )
  function stake() public payable {
    require(timeLeft() > 0, "Deadline has been reached, No more staking");

    // Set the maps:
    balances[msg.sender] = balances[msg.sender] + msg.value;
    // balancesMap.set(msg.sender, balancesMap.get(msg.sender) + msg.value);

    emit Stake(msg.sender, msg.value);

    if (address(this).balance >= threshold) {
      // We're over threshold so emit the complete event and transfer to complete()
      emit Complete(address(this).balance);
      exampleExternalContract.complete{ value: address(this).balance }();
    }
  }

  // function getBalancesAddresses() public view returns (address[] memory) {
  //   return balancesMap.keys;
  // }

  // After some `deadline` allow anyone to call an `execute()` function
  //  It should either call `exampleExternalContract.complete{value: address(this).balance}()` to send all the value

  function execute() public notCompleted {
    // If we've reached the deadline, check if we've met the threshold
    if (timeLeft() == 0) {
      // if the `threshold` was not met, allow everyone to call a `withdraw()` function
      if (address(this).balance >= threshold) {
        // We're over threshold so emit the complete event and transfer to complete()
        emit Complete(address(this).balance);
        exampleExternalContract.complete{ value: address(this).balance }();
      } else {
        openForWithdraw = true;
      }
    }
  }

  // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
  function timeLeft() public view returns (uint256) {
    if (block.timestamp >= deadline) {
      return 0;
    } else {
      return deadline - block.timestamp;
    }
  }

  // Allow stakers to withdraw if openForWithdraw
  function withdraw(address payable _to) public notCompleted {
    require(openForWithdraw == true, "Not open for withdrawals");
    require(balances[_to] > 1 wei, "Must have at least 1 wei balance");

    // Send the balance for _to back to _to
    (bool sent, bytes memory data) = _to.call{ value: balances[_to] }("");
    require(sent, "Failed to withdraw() Ether");

    // Emit an event indicating sucess and set balance to 0
    emit Withdraw(_to, balances[_to]);

    // Update the Mappings
    balances[_to] = 0;
    // balancesMap.remove(_to);
  }

  // Add the `receive()` special function that receives eth and calls stake()
  receive() external payable {
    stake();
  }
}
