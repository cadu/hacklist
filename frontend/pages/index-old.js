import ScreenSize from "../components/Debug/Screensize";
import Head from "next/head";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { HACKLIST_CONTRACT_ADDRESS, abi } from "../constants";
import Footer from "../components/Footer";
import Counter from "../components/Counter";
import Onboarding from "../components/Onboarding";
import Button from "../components/Button";
import Confetti from "react-confetti";
import ButtonLoading from "../components/ButtonLoading";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

  const [showingConfetti, setShowingConfetti] = useState(false);

  // numberOfWhitelisted tracks the number of addresses's whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // numberOfWhitelisted tracks the number of addresses's whitelisted
  const [maxWhitelisted, setMaxWhitelisted] = useState(0);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  const [web3ModalProvider, setWeb3ModalProvider] = useState(null);
  const [hackListContractProvider, setHackListContractProvider] = useState(null);
  const [hackListContractSigner, setHackListContractSigner] = useState(null);

  
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
    await setWeb3ModalProvider(provider);
    

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
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
   * getHackListContracts:  Create contract instances and save for later
   */
  const getHackListContracts = async (signer = false) => {
    try { 
        // setLoading(true);
        // const signer = await web3Provider.getSigner();
        // setLoading(false);
        const contract = null;
        if (signer) {
          contract = new Contract(
            HACKLIST_CONTRACT_ADDRESS,
            abi,
            web3ModalProvider.getSigner()
          );
          setHackListContractSigner(contract);
        } else {
          contract = new Contract(
            HACKLIST_CONTRACT_ADDRESS,
            abi,
            web3ModalProvider
          );
          setHackListContractProvider(contract);
        }
        return contract;
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      // const signer = await getProviderOrSigner(true);
      setLoading(true);
      // const signer = await web3ModalProvider.getSigner();
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      // const whitelistContract = new Contract(
      //   HACKLIST_CONTRACT_ADDRESS,
      //   abi,
      //   signer
      // );
      // const signerContract = getHackListContract(signer);
      // call the addAddressToWhitelist from the contract
      const tx = await hackListContractSigner.addToHackaList();
      
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
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */
  const getNumberOfWhitelisted = async (contract) => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      // const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      // const whitelistContract = new Contract(
      //   HACKLIST_CONTRACT_ADDRESS,
      //   abi,
      //   provider
      // );
      setLoading(true);
      // const hackListContract = getHackListContract(web3ModalProvider);
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted = await contract.numAddressesHackaListed();
      setLoading(false);
      setNumberOfWhitelisted(_numberOfWhitelisted);
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
      // const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      // const whitelistContract = new Contract(
      //   HACKLIST_CONTRACT_ADDRESS,
      //   abi,
      //   provider
      // );

      // call the numAddressesWhitelisted from the contract
      const _maxWhitelisted = await hackListContractProvider.maxHackaListed();
      setMaxWhitelisted(_maxWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async (contract) => {
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      // const signer = await getProviderOrSigner(true);
      // const whitelistContract = new Contract(
      //   HACKLIST_CONTRACT_ADDRESS,
      //   abi,
      //   signer
      // );
      // Get the address associated to the signer which is connected to  MetaMask
      // const address = await signer.getAddress();
      const address = web3ModalProvider.getSigner().getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await contract.hackaListedAddresses(
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
      setLoading(true);
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      const web3Provider = await getProviderOrSigner();
      // setWeb3ModalProvider(web3Provider);
      setWalletConnected(true);
      const providerContract = await getHackListContracts();
      getMaxWhitelisted(providerContract);
      getNumberOfWhitelisted(providerContract);
      const signerContract = await getHackListContracts(true);
      checkIfAddressInWhitelist(signerContract);
      setLoading(false);
      
    } catch (err) {
      console.error(err);
    }
  };
    
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      // await connectWallet();
      async function getProvider() {
        try {
          setLoading(true);
          const web3Provider = await getProviderOrSigner();
          setWeb3ModalProvider(web3Provider);
          setWalletConnected(true);
          const providerContract = await getHackListContracts(web3Provider);
          console.log(providerContract.address);
          // getMaxWhitelisted(providerContract);
          // getNumberOfWhitelisted(providerContract);
          // const signerContract = await getHackListContracts(web3Provider,true);
          // checkIfAddressInWhitelist(signerContract);
          setLoading(false);
          
        } catch (err) {
          console.error(err);
        }
        // await connectWallet();
     }
     getProvider();
    }
  }, [walletConnected]);

  useEffect(() => {
    if (showingConfetti) {
      setTimeout(() => {
        setShowingConfetti(false);
      }, 5000);
    }
  }, [joinedWhitelist]);

  useEffect(() => {
    if (web3ModalProvider) {
      console.log('setou o provider');
    }
  }, [web3ModalProvider]);

  return (
    <>
      <Head>
        <title>HackaList - Your Hackathon Whitelist</title>
        <meta name="description" content="HackaList - Your Hackathon whitelist" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center">
        <div className="bg-white dark:bg-slate-900 dark:text-slate-300 flex-1 mx-auto p-10">
          <div className="grid grid-rows-2 grid-cols-1 md:grid-cols-2 gap-2">
            <section>
              <h1 className="text-3xl font-bold">Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-600">HackaList</span></h1>
              <h3 className="text-xl ">The best Hackathon whitelist tool!</h3>
              { !walletConnected && 
                <Button onClick={connectWallet}>Please connect your wallet</Button>
              }
              { joinedWhitelist &&
                <div className="font-serif shadow-md py-4 text-xl">
                  Thanks for joining the Whitelist! 🎉 
                </div>
              }
              { joinedWhitelist
                && (numberOfWhitelisted < maxWhitelisted) &&

                <p>We still have <strong>{maxWhitelisted - numberOfWhitelisted}</strong> spots available.</p>
              }
              { joinedWhitelist && showingConfetti && <Confetti recycle={showingConfetti} />}
              {
                
                /*
              walletConnected && 
              <Onboarding
              justJoinedWhitelist={justJoinedWhitelist}
              joinedWhitelist={joinedWhitelist}  maxWhitelisted={maxWhitelisted} numberOfWhitelisted={numberOfWhitelisted}
              connectWallet={connectWallet}
              loading={loading}
              showingConfetti={showingConfetti}
              setShowingConfetti={setShowingConfetti}
              addAddressToWhitelist={addAddressToWhitelist}/>
              */
              }
              {
              !joinedWhitelist && numberOfWhitelisted < maxWhitelisted &&
                <div className="description">
                { numberOfWhitelisted == 0 &&
                  <p className="py-4">You're <span className="italic">The One</span>! Nobody has joined the Whitelist yet.</p>
                }
                { numberOfWhitelisted > 0 && numberOfWhitelisted < 4 &&
                  <p className="py-4">You're an OG! Only {numberOfWhitelisted} {numberOfWhitelisted > 1 ? 'hackers' : 'hacker'} have joined the HackaList.</p>
                }
                { numberOfWhitelisted > 3 &&
                  <p className="py-4">{numberOfWhitelisted} hackers have joined the Whitelist.</p>
                }
                  <p>We have <strong>{maxWhitelisted - numberOfWhitelisted}</strong> spots available. Hurry up!</p>
                  <Button onClick={addAddressToWhitelist}>Apply now</Button>
                  <ButtonLoading>My new button</ButtonLoading>
                </div>
              }
              
            </section>
            <section className="inline-block align-middle">
              <img id="hackListCover" className="image" src="./cover-home.svg" />
            </section>
            <footer className="md:col-span-2 text-right align-top   text-gray-400 dark:text-gray-200 ">
              Made with &#10084; by <span>HackShare</span>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}