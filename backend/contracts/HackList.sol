// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract HackList {

  // Number of addresses listed
  uint8 public numAddressesListed;
  
  // Max number of hacker addressess allowed to participate in the hackathon
  uint8 public maxAdressesListed;

  // Map hackers addresses to boolean
  mapping(address => bool) public hackListAddresses;

  // Set the max number of hacker addresses on constructor
  constructor(uint8 _maxAddressesListed) {
    maxAdressesListed = _maxAddressesListed;
  }

  /**
  * addToHackList - Add an address to the HackList
  */
  function addToHackList() public {
    // Check if hacker is already in
    require(!hackListAddresses[msg.sender], "You're a luck one! Already in the HackList!");
    // Check if maxAdressesListed is not reached
    require(numAddressesListed < maxAdressesListed, "Sorry, this HackList is full");
    // Add the address which called the function to the hackListAddresses
    hackListAddresses[msg.sender] = true;
    // Increase the number of HackList addresses
    numAddressesListed += 1;
  }
}