import { ethers, encodeBytes32String } from "ethers";
import * as readline from "readline";
import { readFileSync } from 'fs';
require("dotenv").config()


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const RODRIGO_PRIVATE_KEY = process.env.RODRIGO_PRIVATE_KEY ?? "";
const ERC_20_VOTES = process.env.ERC_20_VOTES ?? "";


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setupProvider() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    return provider;
  };
  

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function main() {

    // Get Provider
    const provider = setupProvider();
    const lastBolck = await provider.getBlockNumber();
    console.log(`Provider connected at block number ${lastBolck}\n`)

    // Connect Wallet to the network using a provider
    const signer = new ethers.Wallet(RODRIGO_PRIVATE_KEY, provider);
    console.log(`Wallet with address ${signer.address} is connected\n`)

    // Get ABI and Bytecode to deploy the contract
    const jsonData = JSON.parse(readFileSync(`artifacts/contracts/TokenizedBallot.sol/Ballot.json`, 'utf8'));
    const abi = jsonData["abi"];
    const byteCode = jsonData["bytecode"];

    // Get input for the constructor
    const proposals = process.argv.slice(2);

    // Get the contract factory and deploy it
    const contractFactory = new ethers.ContractFactory(abi, byteCode, signer);

    const contract = await contractFactory.deploy(
      proposals.map((encodeBytes32String)),
      ERC_20_VOTES,
      lastBolck);
      
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`Contract deplyed at ${contractAddress} by signer ${signer.address}\n`)

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

main().catch((error) => {
    console.log(error);
    process.exitCode = 1; 
})
