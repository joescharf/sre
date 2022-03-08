import { useEthersContext } from 'eth-hooks/context';
import React, { FC } from 'react';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';

export interface IMainPageProps {
  scaffoldAppProviders: IScaffoldAppProviders;
}

/**
 * 🎛 this scaffolding is full of commonly used components
    this <GenericContract/> component will automatically parse your ABI
    and give you a form to interact with it locally
 * @param props 
 * @returns 
 */
export const MainPage: FC<IMainPageProps> = (props) => {
  const ethersContext = useEthersContext();

  if (ethersContext.account == null) {
    return <></>;
  }

  return (
    <div>
      <main className="m-10 lg:relative">
        <div className="w-full pt-16 pb-20 mx-auto text-center max-w-7xl lg:py-48 lg:text-left">
          <div className="px-4 lg:w-1/2 sm:px-8 xl:pr-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              <span className="block xl:inline">Scaffold-Eth Quests</span>{' '}
              <span className="block text-indigo-600 xl:inline">by Joe Scharf</span>
            </h1>
            <p className="max-w-md mx-auto mt-3 text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
              A compilation of my Scaffold-Eth quests on my exploration of smart contracts and blockchain development.
            </p>
          </div>
        </div>
        <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
          <img
            className="absolute inset-0 object-cover w-full h-full rounded-lg"
            src="/mountain-quest.jpg"
            alt="Photo by Kaspar Allenbach on Unsplash"
          />
        </div>
      </main>
    </div>
  );
};
