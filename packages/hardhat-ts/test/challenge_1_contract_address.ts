//
// this script executes when you run 'yarn test'
// and is used to test contracts at an external address like so:
//
// CONTRACT_ADDRESS=0x43Ab1FCd430C1f20270C2470f857f7a006117bbb yarn test --network rinkeby
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//

// Setup chai and chai-as-promised
// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// chai.use(chaiAsPromised);
// const expect = chai.expect;
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, deployments, network } from 'hardhat';

const contractAddress = process.env.CONTRACT_ADDRESS ?? '';
let stakerContract: Contract;

describe('🚩 Challenge 1: 🥩 Decentralized Staking App - External tests', function () {
  if (contractAddress === '') {
    // eslint-disable-next-line mocha/no-setup-in-describe
    console.log('CONTRACT_ADDRESS is not set, skipping external tests');
    return;
  }
  describe('Staker', function () {
    it('Should connect to external contract', async function () {
      stakerContract = await ethers.getContractAt('Staker', contractAddress);
      // await expect(stakerContract).eventually.to.be.fulfilled;
      console.log('     🛰 Connected to external contract', stakerContract.address);
    });
  });
});
