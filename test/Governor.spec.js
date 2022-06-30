const { expect } = require('chai');
const { ethers } = require('hardhat');

beforeEach(async () => {
  [owner, ...addrs] = await ethers.getSigners();

  const governorFactory = await ethers.getContractFactory('Governor');
  governor = await governorFactory.deploy();
});

describe('Governor', function () {
  it('Sets the right owner', async () => {
    expect(await governor.owner()).to.equal(owner.address);
  });

  it('Registers new member', async () => {
    await governor.register('Test', 'test@email.com', addrs[0].address);

    expect(await governor.memberCount()).to.equal(1);

    const member = await governor.getMember(addrs[0].address);

    expect(member.name).to.equal('Test');
    expect(member.email).to.equal('test@email.com');
  });

  it('Deletes existing member', async () => {
    await expect(governor.remove(addrs[0].address)).to.be.revertedWith(
      'Member not registered'
    );

    await governor.register('Test', 'test@email.com', addrs[0].address);

    await governor.remove(addrs[0].address);

    expect(await governor.memberCount()).to.equal(0);
  });
});
