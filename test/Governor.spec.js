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
      'Not a member'
    );

    await governor.register('Test', 'test@email.com', addrs[0].address);
    await governor.register('Test 2', 'test2@email.com', addrs[1].address);

    await governor.remove(addrs[0].address);

    expect(await governor.memberCount()).to.equal(1);
  });

  it('Allows members to propose projects', async () => {
    await expect(
      governor.propose('Test Name', 'Test Description')
    ).to.be.revertedWith('Not a member');

    await governor.register('Test', 'test@email.com', addrs[0].address);

    await governor.connect(addrs[0]).propose('Test Name', 'Test Description');

    expect((await governor.getProjects()).length).to.equal(1);
  });

  it('Allows members to vote on projects', async () => {
    let project;

    await governor.register('Test', 'test@email.com', addrs[0].address);
    await governor.register('Test 2', 'test2@email.com', addrs[1].address);

    await expect(governor.connect(addrs[0]).vote(0)).to.be.revertedWith(
      'Project does not exist'
    );

    await governor.connect(addrs[0]).propose('Test Name', 'Test Description');

    await expect(governor.connect(addrs[0]).vote(0)).to.be.revertedWith(
      'Cannot vote for your own project'
    );

    await governor.connect(addrs[1]).vote(0);

    project = await governor.getProject(0);

    expect(project.votes).to.equal(1);
    expect(project.approved).to.equal(true);

    await expect(governor.connect(addrs[0]).vote(0)).to.be.revertedWith(
      'Project already approved'
    );
  });

  it('Prevents members from voting on projects after period ends', async () => {
    await governor.register('Test', 'test@email.com', addrs[0].address);
    await governor.register('Test 2', 'test2@email.com', addrs[1].address);
    await governor.register('Test 3', 'test3@email.com', addrs[2].address);

    await governor.connect(addrs[0]).propose('Test Name', 'Test Description');

    await governor.connect(addrs[1]).vote(0);

    const VOTING_PERIOD = (await governor.VOTING_PERIOD()).toNumber();

    await network.provider.send('evm_increaseTime', [VOTING_PERIOD]);
    await network.provider.send('evm_mine');

    await expect(governor.connect(addrs[1]).vote(0)).to.be.revertedWith(
      'Vote period has ended'
    );
  });
});
