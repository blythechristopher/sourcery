const { expect } = require('chai');
const { ethers } = require('hardhat');

beforeEach(async () => {
  [owner, ...addrs] = await ethers.getSigners();

  const sourceryFactory = await ethers.getContractFactory('Sourcery');
  sourcery = await sourceryFactory.deploy();
});

describe('Sourcery', function () {
  it('Sets the right owner', async () => {
    expect(await sourcery.owner()).to.equal(owner.address);
  });

  it('Registers new member', async () => {
    await sourcery.register('Test', 'test@email.com', addrs[0].address);

    expect(await sourcery.memberCount()).to.equal(1);

    const member = await sourcery.getMember(addrs[0].address);

    expect(member.name).to.equal('Test');
    expect(member.email).to.equal('test@email.com');
  });

  it('Deletes existing member', async () => {
    await expect(sourcery.remove(addrs[0].address)).to.be.revertedWith(
      'Not a member'
    );

    await sourcery.register('Test', 'test@email.com', addrs[0].address);
    await sourcery.register('Test 2', 'test2@email.com', addrs[1].address);

    await sourcery.remove(addrs[0].address);

    expect(await sourcery.memberCount()).to.equal(1);
  });

  it('Allows members to propose projects', async () => {
    await expect(
      sourcery.propose('Test Name', 'Test Description')
    ).to.be.revertedWith('Not a member');

    await sourcery.register('Test', 'test@email.com', addrs[0].address);

    await sourcery.connect(addrs[0]).propose('Test Name', 'Test Description');

    expect((await sourcery.getProjects()).length).to.equal(1);
  });

  it('Allows members to vote on projects', async () => {
    let project;

    await sourcery.register('Test', 'test@email.com', addrs[0].address);
    await sourcery.register('Test 2', 'test2@email.com', addrs[1].address);

    await expect(sourcery.connect(addrs[0]).vote(0)).to.be.revertedWith(
      'Project does not exist'
    );

    await sourcery.connect(addrs[0]).propose('Test Name', 'Test Description');

    await expect(sourcery.connect(addrs[0]).vote(0)).to.be.revertedWith(
      'Cannot vote for your own project'
    );

    await sourcery.connect(addrs[1]).vote(0);

    project = await sourcery.getProject(0);

    expect(project.votes).to.equal(1);
    expect(project.approved).to.equal(true);

    await expect(sourcery.connect(addrs[0]).vote(0)).to.be.revertedWith(
      'Project already approved'
    );
  });

  it('Prevents members from voting on projects after period ends', async () => {
    await sourcery.register('Test', 'test@email.com', addrs[0].address);
    await sourcery.register('Test 2', 'test2@email.com', addrs[1].address);
    await sourcery.register('Test 3', 'test3@email.com', addrs[2].address);

    await sourcery.connect(addrs[0]).propose('Test Name', 'Test Description');

    await sourcery.connect(addrs[1]).vote(0);

    const VOTING_PERIOD = (await sourcery.VOTING_PERIOD()).toNumber();

    await network.provider.send('evm_increaseTime', [VOTING_PERIOD]);
    await network.provider.send('evm_mine');

    await expect(sourcery.connect(addrs[1]).vote(0)).to.be.revertedWith(
      'Vote period has ended'
    );
  });
});
