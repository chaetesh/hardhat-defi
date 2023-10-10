const { getNamedAccounts, ethers } = require("hardhat")

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth(){
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  // Call the "deposit" function in WETH token
  // to call we need - ABI(or interface), contract address 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
  const iWeth = await ethers.getContractAt(
    "IWeth",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    signer
  );
  // We can fork the mainnet using hardhat, and create a local instance for developing purposes 
  // We dont need to download entire blockchain, we can just give a specifc contract address to fork
  // Here we are forking WETH token contract

//   Depositing WETH
  const tx = await iWeth.deposit({value: AMOUNT});
  await tx.wait(1);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(`Got ${wethBalance} WETH`);
}

module.exports = {getWeth,AMOUNT}