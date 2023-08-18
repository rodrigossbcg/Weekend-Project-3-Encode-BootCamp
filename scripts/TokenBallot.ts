import { ethers } from "ethers";
import * as readline from "readline";
import { readFileSync } from 'fs';
import { Ballot__factory, Ballot } from "../typechain-types";
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
    let contract = Ballot__factory.connect(BALLOT_TOKEN, rod_wallet);
    let contract2 = Ballot__factory.connect(BALLOT_TOKEN, gon_wallet);
    let contract3 = Ballot__factory.connect(BALLOT_TOKEN, rui_wallet);
  
    let votingPower = await contract.votingPower(RODRIGO_ADDRESS);
    console.log(`Rodrigo voting Power is ${votingPower}\n`);
    let votingPower2 = await contract.votingPower(GONCALO_ADDRESS);
    console.log(`Gonçalo voting Power is ${votingPower}\n`);
    let votingPower3 = await contract.votingPower(RUI_ADDRESS);
    console.log(`Rui voting Power is ${votingPower}\n`);

    // Show Proposals avaliable to be voted 
    for (let i = 0; 10; i++) {
        try {
          const proposal = await contract.proposals(i);
          const name = ethers.decodeBytes32String(proposal.name);
          console.log(`Proporsal ${i}: ${name}`);
        }
        catch {break};
    };
    console.log("\n")

    // Gonçalo Delegate Voting Power to Rodrigo
    votingPower2 = await contract2.votingPower(GONCALO_ADDRESS);
    console.log(`Gonçalo voting Power is ${votingPower2}\n`);
    const tx = await contract2.delegate(RODRIGO_ADDRESS);
    await tx.wait();
    console.log("Gonçalo delegated\n")

    // Rodrigo Votes on Proposal 1
    
    votingPower = await contract2.votingPower(RODRIGO_ADDRESS);
    console.log(`Rodrigo new voting Power is ${votingPower}\n`);
    const tx2 = await contract.vote(0, votingPower);
    await tx2.wait()
    console.log("Rodrigo voted on 1\n");

    // Rui Votes on Proposal 2
    
    votingPower3 = await contract3.votingPower(RUI_ADDRESS);
    console.log(`Rui voting Power is ${votingPower3}\n`);
    const tx3 = await contract3.vote(1, votingPower);
    await tx3.wait()
    console.log("Rui voted on 2\n");

    // Declare winner
    await contract.winningProposal();
    const winnerProposal  = await contract.winnerName();
    console.log(`Winner Proposal was ${winnerProposal}`);

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