import { ethers } from "ethers";
import * as readline from "readline";
import { readFileSync } from 'fs';
require("dotenv").config()


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const MINT_VALUE = ethers.parseEther("10");
const RODRIGO_PRIVATE_KEY = process.env.RODRIGO_PRIVATE_KEY ?? "";
const GONCALO_WALLET = process.env.GONCALO_WALLET ?? "";
const RUI_WALLET = process.env.RUI_WALLET ?? "";
const RODRIGO_WALLET = process.env.RODRIGO_WALLET ?? "";


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

    // Get ABI and Bytecode to deply the contract
    const jsonData = JSON.parse(readFileSync(`artifacts/contracts/MyERC20Votes.sol/MyToken.json`, 'utf8'));
    const abi = jsonData["abi"];
    const byteCode = jsonData["bytecode"];

    // Get the contract factory and deploy it
    const contractFactory = new ethers.ContractFactory(abi, byteCode, signer);
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`Contract deplyed at ${contractAddress} by signer ${signer.address}\n`);

    // Mint Tokens
    const contractSigner = new ethers.Contract(contractAddress, abi, signer);
    await contractSigner.mint(RODRIGO_WALLET, MINT_VALUE);
    console.log("1ETH minted to Rodrigo")
    await contractSigner.mint(GONCALO_WALLET, MINT_VALUE);
    console.log("1ETH minted to Gonçalo")
    await contractSigner.mint(RUI_WALLET, MINT_VALUE);
    console.log("1ETH minted to Rui\n")

    // Delegate (to activate voting power)
    await contractSigner.delegate(RODRIGO_WALLET);
    console.log("Rodrigo delegated")
    await contractSigner.delegate(GONCALO_WALLET);
    console.log("Gonçalo delegated")
    await contractSigner.delegate(RUI_WALLET);
    console.log("Rui delegated\n")

    return contract
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


main().catch((error) => {
    console.log(error);
    process.exitCode = 1; 
})
