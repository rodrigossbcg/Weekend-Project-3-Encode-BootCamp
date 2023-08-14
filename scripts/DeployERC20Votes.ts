import { ethers } from "ethers";
import { readFileSync } from 'fs';
import { MyToken__factory } from "../typechain-types";

require("dotenv").config()

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const MINT_VALUE = ethers.parseEther("4");
const SEND1_VALUE = ethers.parseEther("1");
const SEND2_VALUE = ethers.parseEther("2");

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
    const signer = new ethers.Wallet(RODRIGO_PRIVATE_KEY, provider);
    const signer2 = new ethers.Wallet(GONCALO_PRIVATE_KEY, provider);
    const signer3 = new ethers.Wallet(RUI_PRIVATE_KEY, provider);
    console.log(`Wallet with address ${signer.address} is connected\n`)

    // Get ABI and Bytecode to deply the contract
    const jsonData = JSON.parse(readFileSync(`artifacts/contracts/MyERC20Votes.sol/MyToken.json`, 'utf8'));
    const abi = jsonData["abi"];
    const byteCode = jsonData["bytecode"];

    // Get the contract factory and deploy it
    const contractFactory = new MyToken__factory(signer);
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`Contract deplyed at ${contractAddress} by signer ${signer.address}\n`);


    // Mint Tokens 
    const tx1 = await contract.mint(RODRIGO_ADDRESS, MINT_VALUE);
    await tx1.wait();
    console.log("1ETH minted to Rodrigo\n")

    const tx2 = await contract.transfer(GONCALO_ADDRESS, SEND1_VALUE);
    await tx2.wait();
    console.log("1ETH transfered to Gonçalo\n")

    const tx3 = await contract.transfer(RUI_ADDRESS, SEND2_VALUE);
    await tx3.wait();
    console.log("2ETH transfered to Rui\n")


    // Balance of
    const b1 = await contract.balanceOf(RODRIGO_ADDRESS);
    console.log(`Rodrigo Balance: ${b1}`)

    const b2 = await contract.balanceOf(GONCALO_ADDRESS);
    console.log(`Gonçalo Balance: ${b2}`)

    const b3 = await contract.balanceOf(RUI_ADDRESS);
    console.log(`Rui Balance: ${b3} \n`)


    // Delegate (to activate voting power)
    const tx4 = await contract.delegate(RODRIGO_ADDRESS);
    await tx4.wait();
    console.log("Rodrigo delegated")

    const tx5 = await contract.connect(signer2).delegate(GONCALO_ADDRESS);
    await tx5.wait();
    console.log("Gonçalo delegated")

    const tx6 = await contract.connect(signer3).delegate(RUI_ADDRESS);
    await tx6.wait();
    console.log("Rui delegated\n")


    // Voting Power
    const v1 = await contract.getVotes(RODRIGO_ADDRESS);
    console.log(`Rodrigo current VP: ${v1}`)

    const v2 = await contract.getVotes(GONCALO_ADDRESS);
    console.log(`Gonçalo current VP: ${v2}`)

    const v3 = await contract.getVotes(RUI_ADDRESS);
    console.log(`Rui current VP: ${v3} \n`)

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


main().catch((error) => {
    console.log(error);
    process.exitCode = 1; 
})
