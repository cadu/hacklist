import Head from "next/head";
import Web3Modal from "web3modal";
import {useRouter} from "next/router";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { HACKLIST_CONTRACT_ADDRESS, abi } from "../constants";
import Button from "../components/Button";
import Confetti from "react-confetti";

export default function Home() {
  const { query } = useRouter();
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

  const [showingConfetti, setShowingConfetti] = useState(false);
  // numberOfWhitelisted tracks the number of addresses's whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // maxWhitelisted tracks the number of addresses's whitelisted
  const [maxWhitelisted, setMaxWhitelisted] = useState(0);

  const [chainId, setChainId] = useState(null);

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    setChainId(chainId);
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const hackListContract = new Contract(
        HACKLIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToWhitelist from the contract
      const tx = await hackListContract.addToHackList();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
      setShowingConfetti(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getMaxWhitelisted:  gets the max number of whitelisted addresses
   */
  const getMaxWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const hackListContract = new Contract(
        HACKLIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // Get maxAdressesListed from the contract
      const _maxAdressesListed = await hackListContract.maxAdressesListed();
      setMaxWhitelisted(_maxAdressesListed);
      // Debug
      // setMaxWhitelisted(7);
    } catch (err) {
      console.error(err);
    }
  };
  /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */
  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const hackListContract = new Contract(
        HACKLIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // Read numAddressesListed from the contract
      const _numAddressesListed = await hackListContract.numAddressesListed();
      setNumberOfWhitelisted(_numAddressesListed);
      // Debug
      // console.log(query);
      // setNumberOfWhitelisted(2);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async () => {
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        HACKLIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // call the hackListAddresses from the contract
      const _joinedWhitelist = await whitelistContract.hackListAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getMaxWhitelisted();
      getNumberOfWhitelisted();
      
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  useEffect(() => {
    if (showingConfetti) {
      setTimeout(() => {
        setShowingConfetti(false);
      }, 5000);
    }
  }, [joinedWhitelist]);

  return (
    <>
      
      <Head>
        <title>HackList - Your Hackathon Whitelist</title>
        <meta name="description" content="HackList - Your Hackathon whitelist" />
      </Head>
      <div className="flex items-center">
        <div className="bg-white dark:bg-gray-900 dark:text-slate-300 flex-1 mx-auto p-10">
          <div className="grid grid-rows-2 grid-cols-1 lg:grid-cols-2 gap-2">
          <section>
          <h1 className="text-5xl font-bold"><span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-600">HackList</span></h1>
          <div className="sm:flex pt-8 shadow-slate-500 items-center align-top">
            <div className="w-64 lg:w-3/4 sm:w-60 p-4 border-2 rounded">
              <img src="hackathon-logo.svg" className=""/>
            </div>
            <div className="py-4 sm:py-0 sm:px-4">
              <h3 className="sm:py-1 text-3xl text-slate-300">Welcome to <strong>Encode x Polygon Hackaton</strong> on HackList!</h3>
              <p>You can use this platform to save your spot at the hackathon. Connect your wallet and don't miss the chance!</p>
              <p className="pt-2">For more details about the hackathon, please visit: <a className="underline decoration-green-400 decoration-2 underline-offset-4" 
              target="_blank" rel="noopener noreferrer" href="https://www.encode.club/polygon-hackathon">the official website</a>.</p>
            </div>
          </div>
          {
            walletConnected && (numberOfWhitelisted == maxWhitelisted) &&
            <div className="py-6 text-3xl">
              You're late for this hack. Unfortunatelly the applications are closed 🙁.
            </div>
          }
          { !walletConnected && 
            <Button onClick={connectWallet}>Please connect your wallet</Button>
          }
          { joinedWhitelist &&
            <div className="shadow py-6 text-3xl">
              Thanks for joining this HackList! 🎉 
            </div>
          }
          { joinedWhitelist
            && (numberOfWhitelisted < maxWhitelisted) &&
            <p className="text-xl">We still have <strong>{maxWhitelisted - numberOfWhitelisted}</strong> {maxWhitelisted - numberOfWhitelisted == 1 ? 'spot': 'spots'} available.</p>
          }
          { joinedWhitelist && showingConfetti && <Confetti recycle={showingConfetti} />}
          {
          !joinedWhitelist && walletConnected && (numberOfWhitelisted < maxWhitelisted) &&
            <div className="description text-xl">
            { numberOfWhitelisted == 0 &&
              <p className="py-4">You're <span className="italic">The One</span>! No one has joined this HackList yet 😎 </p>
            }
            { numberOfWhitelisted > 0 && numberOfWhitelisted < 4 &&
              <p className="py-4">You're an OG! Only <strong>{numberOfWhitelisted}</strong> {numberOfWhitelisted > 1 ? 'hackers have' : 'hacker has'} joined this HackList.</p>
            }
            { numberOfWhitelisted > 3 &&
              <p className="py-4"><strong>{numberOfWhitelisted}</strong> hackers have joined the HackList.</p>
            }
              <p>We have <strong>{maxWhitelisted - numberOfWhitelisted}</strong> {maxWhitelisted - numberOfWhitelisted == 1 ? 'spot': 'spots'} available. Hurry up!</p>
              <Button onClick={addAddressToWhitelist}>Apply now</Button>
            </div>
          }
          </section>
          <section className="">
            <img id="hackListCover" className="rounded p-1 border-2" src="./cover-home.svg" />
          </section>
          <footer className="lg:col-span-2 text-right align-top   text-gray-400 dark:text-gray-200 ">
            Made with &#10084; by <span><a href="https://hackshare.xyz">HackShare</a></span>
          </footer>
        </div>
      </div>
    </div>
    </>
  );
}