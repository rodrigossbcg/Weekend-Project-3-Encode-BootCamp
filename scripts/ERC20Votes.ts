import {ethers} from "hardhat";
import { MyToken__factory } from "../typechain-types";

const MINT_VALUE = ethers.parseUnits("1");
async function main() {
  const [rodrigo, gonçalo, rui] = await ethers.getSigners();
  const contractFactory = new MyToken__factory(rodrigo);
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}\n`);




  // Mint some tokens
  console.log(`------------------------------------------------ \n`);
  console.log(`Rodrigo's Operations : `);
  
  const mintTx = await contract.mint(rodrigo.address, MINT_VALUE);
  await mintTx.wait();
  console.log(`Minted ${MINT_VALUE.toString()} decimal units to account ${rodrigo.address}` );
  const balanceBN = await contract.balanceOf(rodrigo.address);
  console.log(`Account ${rodrigo.address} has ${balanceBN.toString()} decimal units of MyToken\n`);

  // Check the voting power
  console.log(`Check the voting power: `);
  const votes = await contract.getVotes(rodrigo.address);
  console.log(`Account ${rodrigo.address} has ${votes.toString()} units of voting power before self delegating\n`);

  // Self delegate
  console.log(`Self delegate: `);
  const delegateTx = await contract.connect(rodrigo).delegate(rodrigo.address);
  await delegateTx.wait();
  console.log(`Account ${rodrigo.address} delegated \n`);
  // Check the voting power
  console.log(`Check the voting power: `);
  const votesAfter = await contract.getVotes(rodrigo.address);
  console.log(`Account ${rodrigo.address} has ${votesAfter.toString()} units of voting power after self delegating\n`);

  // Transfer tokens
  console.log(`Transfer tokens to Gonçalo: `);
  const transferTx = await contract.connect(rodrigo).transfer(gonçalo.address, MINT_VALUE );await transferTx.wait();
  console.log(`Account ${rodrigo.address} send tokent to ${rodrigo.address} \n`);

  // Check the voting power
  console.log(`Check the voting power : `);
  const votes1AfterTransfer = await contract.getVotes(rodrigo.address);
  console.log(`Rodrigo Account ${rodrigo.address} has ${votes1AfterTransfer.toString()} units of voting power after transfering`);
  const votes2AfterTransfer = await contract.getVotes(gonçalo.address);
  console.log(`Gonçalo Account ${gonçalo.address} has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer`);
  const votes3AfterTransfer = await contract.balanceOf(gonçalo.address);
  console.log(`Gonçalo Account ${gonçalo.address} has ${votes3AfterTransfer.toString()} BALANCE of voting power after receiving a transfer\n`);


  console.log(`------------------------------------------------ \n`);
  console.log(`Gonçalo's Operations : \n`);

    // Self delegate
    console.log(`Self delegate: `);
    const gonçalodelegateTx = await contract.connect(gonçalo).delegate(gonçalo.address);
    await gonçalodelegateTx.wait();
    console.log(`Account ${gonçalo.address} delegated \n`);

      // Check the voting power
    console.log(`Check the voting power : `);
    const tx2 = await contract.getVotes(gonçalo.address);
    console.log(`Gonçalo Account ${gonçalo.address} has ${tx2.toString()} units of voting power after receiving a transfer`);
    const tx3 = await contract.balanceOf(gonçalo.address);
    console.log(`Gonçalo Account ${gonçalo.address} has ${tx3.toString()} units of voting power after receiving a transfer\n`);

    // Mint some tokens
    console.log(`Rodrigo will mint to Gonçalo: `);
    const mintTx2 = await contract.mint(gonçalo.address, MINT_VALUE);
    await mintTx2.wait();
    console.log(`Minted ${MINT_VALUE.toString()} decimal units to account ${gonçalo.address}` );
    const balanceBN2 = await contract.balanceOf(gonçalo.address);
    console.log(`Account ${gonçalo.address} has ${balanceBN2.toString()} decimal units of MyToken\n`);


    // Transfer tokens
    console.log(`Transfer tokens to Rui: `);
    const transferTx2 = await contract.connect(gonçalo).transfer(rui.address, MINT_VALUE );await transferTx.wait();
    console.log(`Account ${gonçalo.address} send ${MINT_VALUE} tokent to ${rui.address} \n`);
  
    // Check the voting power
    console.log(`Check the voting power : `);
    const votesaTransfer = await contract.getVotes(rodrigo.address);
    console.log(`Gonçalo Account ${gonçalo.address} has ${votesaTransfer.toString()} units of voting power after transfering`);
    const votesa2Transfer = await contract.getVotes(gonçalo.address);
    console.log(`Rui Account ${rui.address} has ${votesa2Transfer.toString()} units of voting power after receiving a transfer`);
    const votesa3Transfer = await contract.balanceOf(gonçalo.address);
    console.log(`Rui Account ${rui.address} has ${votesa3Transfer.toString()} units of voting power after receiving a transfer\n`);
    

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});