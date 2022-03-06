import { formatEther, parseEther } from '@ethersproject/units';
import { CheckIcon, RefreshIcon, XCircleIcon } from '@heroicons/react/outline';
import { EtherInput, Balance } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useBalance, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { TEthersProvider } from 'eth-hooks/models';
import { BigNumber } from 'ethers';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import React, { useState, useEffect, FC, useContext } from 'react';

import { useAppContracts } from '~~/config/contractContext';

const langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
const humanizer: HumanizeDuration = new HumanizeDuration(langService);

export interface StakerProps {
  mainnetProvider: TEthersProvider | undefined;
}

export const Staker: FC<StakerProps> = (props) => {
  const { mainnetProvider } = props;

  // ethersContext setup
  const ethersContext = useEthersContext();

  const [yourCurrentBalance] = useBalance(ethersContext.account ?? '');
  console.log('💵 yourCurrentBalance:', yourCurrentBalance.toString());

  // Contracts setup with useAppContracs
  const stakerContract = useAppContracts('Staker', ethersContext.chainId);
  const externalContract = useAppContracts('ExampleExternalContract', ethersContext.chainId);

  const [totalStaked] = useBalance(stakerContract?.address);
  console.log('💵 totalStaked:', totalStaked.toString());

  // Setup eth-components and gasPrice to setup transactor
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast'); // eth-hook
  const [ethPrice] = useDexEthPrice(mainnetProvider);
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  // React UseState and UseEffect initialization
  const [threshold, setThreshold] = useState<BigNumber>();
  useEffect(() => {
    const getThreshold = async (): Promise<void> => {
      const threshold = await stakerContract?.threshold();
      console.log('💵 threshold:', threshold);
      setThreshold(threshold);
    };
    void getThreshold();
  }, [yourCurrentBalance]);

  // balanceStaked is contributor's balance
  const [balanceStaked, setBalanceStaked] = useState<BigNumber>();
  const [userHasBalance, setUserHasBalance] = useState<boolean>(false);
  useEffect(() => {
    const getBalanceStaked = async (): Promise<void> => {
      const balanceStaked = await stakerContract?.balances(ethersContext?.account ?? '');
      console.log('💵 balanceStaked:', balanceStaked);
      setBalanceStaked(balanceStaked);
      setUserHasBalance(balanceStaked?.gt(0) ?? false);
      console.log('💵 userHasBalance:', userHasBalance);
    };
    void getBalanceStaked();
  }, [yourCurrentBalance]);

  const [timeLeft, setTimeLeft] = useState<BigNumber>();
  useEffect(() => {
    const getTimeLeft = async (): Promise<void> => {
      const timeLeft = await stakerContract?.timeLeft();
      console.log('⏳ timeLeft:', timeLeft);
      setTimeLeft(timeLeft);
    };
    void getTimeLeft();
  }, [yourCurrentBalance]);

  const [completed, setCompleted] = useState<boolean>(false);
  useEffect(() => {
    const getCompleted = async (): Promise<void> => {
      const completed = await externalContract?.completed();
      console.log('✅ complete:', completed);
      setCompleted(completed ?? false);
    };
    void getCompleted();
  }, [yourCurrentBalance]);

  // COMPLETED RENDERING
  let completeDisplay = <></>;
  if (completed) {
    completeDisplay = (
      <div style={{ padding: 64, backgroundColor: '#eeffef', fontWeight: 'bolder' }}>
        🚀 🎖 👩‍🚀 - Staking App triggered `ExampleExternalContract` -- 🎉 🍾 🎊
        <Balance address={externalContract?.address} /> ETH staked!
      </div>
    );
  }

  const [stakeAmount, setStakeAmount] = useState('0.0');

  const stakerExecute = async (): Promise<void> => {
    if (tx) {
      await tx(stakerContract?.execute());
    }
  };

  const stakerStake = async (): Promise<void> => {
    if (tx) {
      await tx(stakerContract?.stake({ value: parseEther(stakeAmount) }));
    }
  };

  const withdrawStake = async (): Promise<void> => {
    if (tx) {
      await tx(stakerContract?.withdraw(ethersContext.account ?? ''));
    }
  };
  const timeLeftHumanized = humanizer.humanize(timeLeft?.toNumber() * 1000);
  console.log(timeLeftHumanized);
  const stats = [
    { name: 'Funds Raised', stat: formatEther(totalStaked ?? '0') },
    { name: 'Funding Goal ', stat: formatEther(threshold ?? 0) },
    { name: 'Your Contribution', stat: formatEther(balanceStaked ?? '0') },
  ];

  return (
    <div className="px-10 mx-10 mt-10 border rounded-2xl">
      <div className="mt-4">
        <h3 className="text-4xl font-medium text-gray-900 leading-6 dark:text-white">Crowd Fund</h3>
      </div>
      <div className="flex items-center justify-around mt-10">
        <div className="text-2xl font-medium text-gray-900 leading-6 dark:text-white">
          {/* Title */}Raising Funds to support A Cause
          <div className="flex mt-1 text-sm text-gray-500 space-x-4 dark:text-white">
            <div>Crowdfund</div>
            <div>{stakerContract?.address.toString().slice(0, 6)}</div>
          </div>
        </div>
        <div className="">
          {/* Status */}

          {timeLeft?.toNumber() !== 0 && !completed && (
            <div className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-yellow-400 border border-transparent rounded-md shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400">
              <div className="flex flex-col items-center mr-2">
                <div>Time Remaining</div>
                <div className="text-xl font-semibold">{timeLeftHumanized}</div>
              </div>
              <button type="button" onClick={stakerExecute}>
                <RefreshIcon className="w-5 h-5 ml-3 -mr-1" aria-hidden="true" />
              </button>
            </div>
          )}
          {timeLeft?.toNumber() === 0 ||
            (completed && (
              <div className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Project Funded
                <CheckIcon className="w-5 h-5 ml-3 -mr-1" aria-hidden="true" />
              </div>
            ))}
          {timeLeft?.toNumber() === 0 && !completed && (
            <div className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Project Failed
              <XCircleIcon className="w-5 h-5 ml-3 -mr-1" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
      {/* STATS BOXES */}
      <div className="mt-4">
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.name}
              className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow dark:bg-gray-900 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 uppercase truncate dark:text-white">{item.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{item.stat}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* STAKING BOX */}

      {timeLeft?.toNumber() !== 0 && !completed && (
        <div className="flex items-center justify-between px-10 py-5 mb-5 text-xl text-left border rounded-2xl bg-slate-50">
          {/* BACK THIS PROJECT */}
          <div>
            <p className="mb-0 text-sm font-medium text-blue-700 uppercase">Back this project</p>
            <label htmlFor="email" className="block text-sm text-gray-700 font-base">
              Contribute some ETH to the cause!
            </label>
          </div>

          {/* INPUT AND BUTTON */}
          <div className="flex space-x-4">
            <EtherInput
              autoFocus
              placeholder={'1'}
              price={ethPrice}
              value={stakeAmount ?? ''}
              onChange={(value: string): void => {
                setStakeAmount(value);
              }}
            />
            <button
              type="button"
              className="text-sm font-medium text-white bg-green-600 border border-transparent rounded px-2.5 py-1.5 shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={stakerStake}>
              Stake
            </button>
          </div>
        </div>
      )}
      {/* PROJECT FAILED WITHDRAW BOX */}
      {timeLeft?.toNumber() === 0 && !completed && userHasBalance && (
        <div className="flex items-center justify-between px-10 py-5 mb-5 text-xl text-left bg-red-100 border rounded-2xl">
          {/* WITHRAW FUNDS */}
          <div>
            <p className="mb-0 text-sm font-medium text-blue-700 uppercase">PROJECT NOT FUNDED</p>
            <label htmlFor="email" className="block text-sm text-gray-700 font-base">
              You may withdraw your contribution
            </label>
          </div>

          {/* Withdraw BUTTON */}
          <div className="flex space-x-4">
            <button
              type="button"
              className="text-sm font-medium text-white bg-green-600 border border-transparent rounded px-2.5 py-1.5 shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={withdrawStake}>
              Withdraw Funds
            </button>
          </div>
        </div>
      )}
      {completeDisplay}
    </div>
  );
};
