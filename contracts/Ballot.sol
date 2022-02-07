// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Ballot {

   struct Voter {
      address Voter;
      uint256 vote;
      bool isVoted;
   }

   struct Proposal {
      bytes32 name;
      uint256 voteCount;
   }

   mapping(address => Voter) voters;

   address public chairperson;

   Proposal[] public proposals;

   constructor(bytes32[] memory proposalNames) {
      chairperson = msg.sender;

      for (uint256 i = 0; i < proposalNames.length; i++) {
         proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
      }
   }

   function Vote(uint256 _indexOfProposal) public {
      Voter storage sender = voters[msg.sender];
      // Check if is voted
      require(!sender.isVoted, "Already voted.");
      sender.vote = _indexOfProposal;
      sender.isVoted = true;

      proposals[_indexOfProposal].voteCount += 1;
   }

   function getAllProposals() external view returns (Proposal[] memory) {
      Proposal[] memory items = new Proposal[](proposals.length);
      
      for (uint256 i = 0; i < proposals.length; i++) {
         items[i] = proposals[i];
      }
      
      return items;
   }
}
