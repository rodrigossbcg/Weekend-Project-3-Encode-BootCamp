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

    // Get Provider
    const provider = setupProvider();
    const lastBolck = await provider.getBlockNumber();
    console.log(`Provider connected at block number ${lastBolck}\n`)

    // Get ABI
    const jsonData = JSON.parse(readFileSync("artifacts/contracts/TokenizedBallot.sol/Ballot.json", 'utf8'));
    const abi = jsonData["abi"];

    // Get the contract factory and connect to it
    const ballotContract = new ethers.Contract(BALLOT_TOKEN, abi, rod_wallet);
    const tx1 = await ballotContract.delegateVotingPower();
    console.log(tx1)

    return ballotContract
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function main() {
    TokenBallot();
}


main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
})