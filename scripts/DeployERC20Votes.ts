import { ethers } from "ethers";
import { readFileSync } from 'fs';
require("dotenv").config()


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const MINT_VALUE = ethers.parseEther("10");
const RODRIGO_PRIVATE_KEY = process.env.RODRIGO_PRIVATE_KEY ?? "";
const GONCALO_PRIVATE_KEY = process.env.GONCALO_PRIVATE_KEY ?? "";
const RUI_PRIVATE_KEY = process.env.RUI_PRIVATE_KEY ?? "";

const GONCALO_ADDRESS = process.env.GONCALO_ADDRESS ?? "";
const RUI_ADDRESS = process.env.RUI_ADDRESS ?? "";
const RODRIGO_ADDRESS = process.env.RODRIGO_ADDRESS ?? "";


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
    const signer= new ethers.Wallet(RODRIGO_PRIVATE_KEY, provider);
    const signer2 = new ethers.Wallet(GONCALO_PRIVATE_KEY, provider);
    const signer3 = new ethers.Wallet(RUI_PRIVATE_KEY, provider);
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

    // Connect contract to signer
    const contractSigner = new ethers.Contract(contractAddress, abi, signer);

    // Mint Tokens
    const tx1 = await contractSigner.mint(RODRIGO_ADDRESS, MINT_VALUE);
    await tx1.wait();
    console.log("1ETH minted to Rodrigo\n")

    // Balance of
    const b1 = await contractSigner.balanceOf(RODRIGO_ADDRESS);
    console.log(`Rodrigo Balance: ${b1}`)
    const b2 = await contractSigner.balanceOf(GONCALO_ADDRESS);
    console.log(`Gonçalo Balance: ${b2}`)
    const b3 = await contractSigner.balanceOf(RUI_ADDRESS);
    console.log(`Rui Balance: ${b3} \n`)

    // Delegate (to activate voting power)
    const tx2 = await contractSigner.delegate(RODRIGO_ADDRESS);
    await tx2.wait();
    console.log("Rodrigo delegated")

    // Voting Power
    const v1 = await contractSigner.getVotes(RODRIGO_ADDRESS);
    console.log(`Rodrigo current VP: ${v1}`)
    const v2 = await contractSigner.getVotes(GONCALO_ADDRESS);
    console.log(`Gonçalo current VP: ${v2}`)
    const v3 = await contractSigner.getVotes(RUI_ADDRESS);
    console.log(`Rui current VP: ${v3} \n`)

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


main().catch((error) => {
    console.log(error);
    process.exitCode = 1; 
})
