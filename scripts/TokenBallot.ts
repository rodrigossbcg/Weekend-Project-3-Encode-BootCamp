import { ethers } from "ethers";
import * as readline from "readline";
import { readFileSync } from 'fs';
require("dotenv").config()


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const RODRIGO_PRIVATE_KEY = process.env.RODRIGO_PRIVATE_KEY ?? "";
const RUI_PRIVATE_KEY = process.env.RUI_PRIVATE_KEY ?? "";
const GONCALO_PRIVATE_KEY = process.env.GONCALO_PRIVATE_KEY ?? "";

const GONCALO_ADDRESS = process.env.GONCALO_ADDRESS ?? "";
const RUI_ADDRESS = process.env.RUI_ADDRESS ?? "";
const RODRIGO_ADDRESS = process.env.RODRIGO_ADDRESS ?? "";

const BALLOT_TOKEN = process.env.BALLOT_TOKEN ?? "";


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setupProvider() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    return provider;
  };


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getWallets() {

    // Get Provider
    const provider = setupProvider();
    const lastBolck = await provider.getBlockNumber();
    console.log(`Provider connected at block number ${lastBolck}\n`)

    // Connect Wallet to the network using a provider
    const rod_wallet = new ethers.Wallet(RODRIGO_PRIVATE_KEY, provider);
    const rui_wallet = new ethers.Wallet(RUI_PRIVATE_KEY, provider);
    const gon_wallet = new ethers.Wallet(GONCALO_PRIVATE_KEY, provider);

    return {rod_wallet, rui_wallet, gon_wallet}
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function TokenBallot() {

    // Get Wallets
    const {rod_wallet, rui_wallet, gon_wallet} = await getWallets();
    
    // Get ABI
    const jsonData = JSON.parse(readFileSync("artifacts/contracts/TokenizedBallot.sol/Ballot.json", 'utf8'));
    const abi = jsonData["abi"];

    // Get the contract factory and connect to it
    const ballotContract = new ethers.Contract(BALLOT_TOKEN, abi, rod_wallet);
    let votingPower = await ballotContract.votingPower(RODRIGO_ADDRESS);
    console.log(`Rodrigo voting Power is ${votingPower}`);

    // Show Proposals avaliable to be voted 
    for (let i = 0; 10; i++) {
        try {
          const proposal = await ballotContract.proposals(i);
          const name = ethers.decodeBytes32String(proposal.name);
          console.log(`Proporsal ${i}: ${name}`);
        }
        catch {break};
    };

    // Gonçalo Delegate Voting Power to Rodrigo
    votingPower = await ballotContract.votingPower(GONCALO_ADDRESS);
    console.log(`Gonçalo voting Power is ${votingPower}\n`);
    ballotContract.connect(gon_wallet)
    const tx1 = await ballotContract.delegateVotingPower(RODRIGO_ADDRESS, votingPower);
    await tx1.wait();
    await ballotContract.vote(1, votingPower);

    // Rodrigo Votes on Proposal 1
    ballotContract.connect(rod_wallet)
    votingPower = await ballotContract.votingPower(RODRIGO_ADDRESS);
    console.log(`Rodrigo new voting Power is ${votingPower}\n`);
    const tx2 = await ballotContract.vote(0, votingPower);
    await tx2.wait()
    console.log("Rodrigo voted on 1\n");

    // Rui Votes on Proposal 2
    ballotContract.connect(rui_wallet)
    votingPower = await ballotContract.votingPower(RUI_ADDRESS);
    console.log(`Rui voting Power is ${votingPower}\n`);
    const tx3 = await ballotContract.vote(1, votingPower);
    await tx3.wait()
    console.log("Rui voted on 2\n");

    // Declare winner
    await ballotContract.winningProposal();
    const winnerProposal  = await ballotContract.winnerName();
    console.log(`Winner Proposal was ${winnerProposal}`);

    return ballotContract
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function main() {
    TokenBallot();
}


main().catch((error) => {
    console.log(error);
    process.exitCode=1;
})