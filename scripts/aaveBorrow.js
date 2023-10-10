const { ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("./getWeth");

async function main() {
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  // The aave protocol treats everything as an ERC20 token
  // WETH is an erc20 token
  await getWeth();

  // Lending Pool The LendingPool contract is the main contract of the protocol. It exposes all the user-oriented actions like deposit,borrow etc that can be invoked using either Solidity or web3 libraries.

  // Aave Lending Pool address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
  const lendingPool = await getLendingPool(signer);
  console.log(`Lending Pool Address: ${lendingPool.address}`);

  // for depositing Weth in aave
  const wethTokenaddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  // Approve the token to deposit
  await approveErc20(wethTokenaddress, lendingPool.address, AMOUNT, signer);
  console.log("Depositing....");
  // The address of the underlying asset to deposit
  await lendingPool.deposit(wethTokenaddress, AMOUNT, signer.address, 0);
  console.log("Deposited!!");

  // For borrowing, how much we have in collateral & how much we can borrow
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserdata(
    lendingPool,
    deployer
  );

  // As we got amount we can borrow, we need to get conversion rate of dai to borrow it
  // we can use chainlink to get dai price
  const daiPrice = await getDaiPrice();

  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  console.log(`You can Borrow ${amountDaiToBorrow} DAI`);

  // dai in wei
  const amountDaiToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );

  // To borrow dai from deposited eth
  await borrowDai(
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    lendingPool,
    amountDaiToBorrowWei,
    deployer
  );

  await getBorrowUserdata(lendingPool, deployer);
  await repay(amountDaiToBorrowWei, "0x6B175474E89094C44Da98b954EedeAC495271d0F",lendingPool,deployer,signer);
  await getBorrowUserdata(lendingPool, deployer);
}

async function repay(amount, daiAddress, lendingPool, account,signer) {
  await approveErc20(daiAddress, lendingPool.address, amount, signer);
  const repayTx = await lendingPool.repay(daiAddress, amount, 2, account);
  await repayTx.wait(1);
  console.log("Repaid!");
}


async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrow,
    2,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log("You'he Borrowed!!!");
}

async function getDaiPrice() {
  // reading from contract, no need signer
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616e4d11a78f511299002da57a0a94577f1f4"
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
}

async function approveErc20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!!!");
}

async function getBorrowUserdata(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH`);
  return { availableBorrowsETH, totalDebtETH };
}

async function getLendingPool(account) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );

  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();
  // Using returned addrees of lending pool from above statement
  // lendingPoolAddressesProvider consists of all addresses including lending pool, which used to deposit and borrow in aave
  const lendingpool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingpool;
}

main();
