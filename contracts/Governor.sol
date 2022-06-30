//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Governor is Ownable {
  struct Member {
    string name;
    string email;
  }

  uint256 public memberCount;
  mapping(address => Member) private members;

  function register(
    string calldata _name,
    string calldata _email,
    address _wallet
  ) external onlyOwner {
    require(
      keccak256(abi.encodePacked(members[_wallet].name)) ==
        keccak256(abi.encodePacked("")),
      "Member already registered"
    );

    Member memory member;
    member.name = _name;
    member.email = _email;

    members[_wallet] = member;
    memberCount++;
  }

  function remove(address _wallet) external onlyOwner {
    require(
      keccak256(abi.encodePacked(members[_wallet].name)) !=
        keccak256(abi.encodePacked("")),
      "Member not registered"
    );

    delete members[_wallet];
    memberCount--;
  }

  function getMember(address _wallet) public view returns (Member memory) {
    return members[_wallet];
  }
}
