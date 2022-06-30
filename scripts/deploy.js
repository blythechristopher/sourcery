const hre = require('hardhat');

async function main() {
  const Governor = await hre.ethers.getContractFactory('Governor');
  const governor = await Governor.deploy();

  await governor.deployed();

  console.log('Governor deployed to:', governor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
