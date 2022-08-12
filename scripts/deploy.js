const hre = require('hardhat');

async function main() {
  const Sourcery = await hre.ethers.getContractFactory('Sourcery');
  const sourcery = await Sourcery.deploy();

  await sourcery.deployed();

  console.log('Sourcery deployed to:', sourcery.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
