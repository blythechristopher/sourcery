//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Governor is Ownable {
  struct Member {
    string name;
    string email;
  }

  struct Project {
    string name;
    string description;
    uint256 date;
    uint256 votes;
    bool approved;
  }

  uint256 public quorum = 80;
  uint256 public memberCount;
  uint256 public projectCount;

  uint256 public constant VOTING_PERIOD = 1 weeks;

  mapping(address => Member) private members;
  mapping(uint256 => Project) private projects;
  mapping(uint256 => address[]) private votes;

  modifier onlyMembers(address _wallet) {
    require(
      keccak256(abi.encodePacked(members[_wallet].name)) !=
        keccak256(abi.encodePacked("")),
      "Not a member"
    );
    _;
  }

  function propose(string calldata _name, string calldata _description)
    external
    onlyMembers(msg.sender)
  {
    projects[projectCount] = Project(
      _name,
      _description,
      block.timestamp,
      0,
      false
    );
    projectCount++;
  }

  function vote(uint256 _projectId) external onlyMembers(msg.sender) {
    require(
      keccak256(abi.encodePacked(projects[_projectId].name)) !=
        keccak256(abi.encodePacked("")),
      "Project does not exist"
    );
    require(projects[_projectId].approved == false, "Project already approved");
    require(
      projects[_projectId].date + VOTING_PERIOD > block.timestamp,
      "Vote period has ended"
    );

    for (uint256 i = 0; i < projects[_projectId].votes; i++) {
      if (votes[_projectId][i] == msg.sender) {
        revert("Already voted");
      }
    }

    projects[_projectId].votes += 1;
    votes[_projectId].push(msg.sender);

    if ((projects[_projectId].votes / memberCount) * 100 >= quorum) {
      projects[_projectId].approved = true;
    }
  }

  function getProjects() external view returns (Project[] memory) {
    Project[] memory result = new Project[](projectCount);

    for (uint256 i = 0; i < projectCount; i++) {
      Project storage project = projects[i];
      result[i] = project;
    }

    return result;
  }

  function getProject(uint256 _projectId) public view returns (Project memory) {
    return projects[_projectId];
  }

  function getMember(address _wallet) public view returns (Member memory) {
    return members[_wallet];
  }

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

    members[_wallet] = Member(_name, _email);
    memberCount++;
  }

  function remove(address _wallet) external onlyOwner onlyMembers(_wallet) {
    delete members[_wallet];
    memberCount--;
  }

  function setQuorum(uint256 _quorum) external onlyOwner {
    quorum = _quorum;
  }
}
