// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}

/// @title Voting with delegation.
contract Ballot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    IMyToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;
    mapping(address => uint256) public votingPowerSpent;
    mapping(address => address) private _delegates;

    constructor(
        bytes32[] memory proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function votingPower(address account) public view returns (uint256) {
        uint256 delegatedPower = _delegatedPowerOf(account);
        return
            tokenContract.getPastVotes(account, targetBlockNumber) +
            delegatedPower -
            votingPowerSpent[account];
    }

    function _delegatedPowerOf(address account) private view returns (uint256) {
        return
            tokenContract.getPastVotes(_delegates[account], targetBlockNumber) -
            votingPowerSpent[_delegates[account]];
    }

    function delegate(address to) public {
        require(to != msg.sender, "You cannot delegate to yourself.");
        _delegates[msg.sender] = to;
    }

    function vote(uint proposal, uint256 amount) external {
        require(
            amount <= votingPower(msg.sender),
            "User has not enough voting power to vote"
        );

        votingPowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
