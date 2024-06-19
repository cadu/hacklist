import Head from "next/head";
import Image from "next/image";
import HackathonLogo from "../public/hackathon-logo.svg";
import { useRef, useEffect, useState } from "react";
import { Contract } from "ethers";
import { abi } from "../constants";
import Nav from "../components/Nav";
import Button from "../components/Button";
import Confetti from "react-confetti";
import { useConnectionContext } from "../components/ConnectionContext";
import { useSpinnerContext } from "../context/SpinnerContext";

export default function Home() {
  const contractAddress = process.env.NEXT_PUBLIC_HACKLIST_CONTRACT_ADDRESS;
  const {
    web3Provider,
    connectWallet,
    walletConnected,
    chainId,
    changeNetwork,
  } = useConnectionContext();

  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  const [showingConfetti, setShowingConfetti] = useState(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const [maxWhitelisted, setMaxWhitelisted] = useState(0);

  const [networkConnected, setNetworkConnected] = useState(null);

  const { isSpinnerOn, setIsSpinnerOn } = useSpinnerContext();

  const hackListContractProvider = useRef();
  const hackListContractSigner = useRef();

  /**
   * addAddressToWhitelist: Adds the connected account/address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
      setIsSpinnerOn(true);
      // call the function addToHackList from the contract
      const tx = await hackListContractSigner.current.addToHackList();

      // wait for the transaction to get mined
      await tx.wait();
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
      setShowingConfetti(true);
    } catch (err) {
      if (err.error.message) {
        alert(err.error.message);
      } else {
        alert(err);
      }
    } finally {
      setIsSpinnerOn(false);
    }
  };

  /**
   * getMaxWhitelisted:  gets the max number of whitelisted addresses from the contract
   */
  const getMaxWhitelisted = async () => {
    try {
      setIsSpinnerOn(true);
      // Get maxAdressesListed from the contract
      const _maxAdressesListed =
        await hackListContractProvider.current.maxAdressesListed();
      setMaxWhitelisted(_maxAdressesListed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpinnerOn(false);
    }
  };

  /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses from the contract
   */
  const getNumberOfWhitelisted = async () => {
    try {
      setIsSpinnerOn(true);
      // Read numAddressesListed from the contract
      const _numAddressesListed =
        await hackListContractProvider.current.numAddressesListed();
      setNumberOfWhitelisted(_numAddressesListed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpinnerOn(false);
    }
  };

  /**
   * checkIfAddressInWhitelist: Checks if the address is in the whitelist
   */
  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = web3Provider.getSigner();
      // Get the address associated to the signer which is connected to MetaMask
      const address = await signer.getAddress();
      setIsSpinnerOn(true);
      // Send user's address to the hackListAddresses mapping to check if it is in the list
      const _joinedWhitelist =
        await hackListContractSigner.current.hackListAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpinnerOn(false);
    }
  };

  const toggleTheme = () => {
    if (localStorage.theme && localStorage.theme == "light") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  useEffect(() => {
    if (showingConfetti) {
      setTimeout(() => {
        setShowingConfetti(false);
      }, 5000);
    }
  }, [joinedWhitelist]);

  useEffect(() => {
    if (!web3Provider) return;
    // Check if current chainId is Sepolia (11155111)
    if (chainId == 11155111) {
      setNetworkConnected(true);
      hackListContractProvider.current = new Contract(
        contractAddress,
        abi,
        web3Provider
      );
      const signer = web3Provider.getSigner();
      hackListContractSigner.current = new Contract(
        contractAddress,
        abi,
        signer
      );
      checkIfAddressInWhitelist();
      getMaxWhitelisted();
      getNumberOfWhitelisted();
    } else {
      changeNetwork();
    }
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [web3Provider]);

  return (
    <>
      <Head>
        <title>HackList - Your Hackathon Whitelist</title>
        <meta
          name="description"
          content="HackList - Your Hackathon Whitelist"
        />
      </Head>
      <div className="flex items-center flex-1 p-10">
        {joinedWhitelist && showingConfetti && (
          <Confetti
            recycle={showingConfetti}
            width={window.innerWidth - 20}
            height={document.body.scrollHeight}
          />
        )}
        <section className="lg:w-10/12 flex-auto">
          <Nav toggleTheme={toggleTheme} />
          <div className="flex-row sm:flex pt-8 shadow-slate-500 justify-center">
            <div className="w-full sm:w-60 p-4 border-2 rounded bg-slate-700 dark:bg-transparent">
              <Image src={HackathonLogo} alt="Encode x Polygon logo" />
            </div>
            <div className="py-4 sm:py-0 sm:px-4 flex-auto w-full">
              <h3 className="py-3 sm:pb-4 sm:pt-0 text-3xl text-slate-500 dark:text-slate-300">
                Welcome to <strong>Encode x Polygon Hackathon</strong> on
                HackList! {contractAddress}
              </h3>
              <p>
                You can use this platform to save your spot at the hackathon.
                Connect your wallet and don&quot;t miss the chance!
              </p>
              <p className="pt-2">
                For more details about the hackathon, please visit{" "}
                <a
                  className="underline decoration-green-400 decoration-2 underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.encode.club/polygon-hackathon"
                >
                  the official website
                </a>
                .
              </p>
            </div>
          </div>
          {!walletConnected && (
            <Button onClick={connectWallet} loading={isSpinnerOn}>
              Please connect your wallet
            </Button>
          )}
          {walletConnected && !networkConnected && (
            <div className="py-6 text-3xl">
              Please connect to the Sepolia Network on your wallet.
            </div>
          )}

          {joinedWhitelist ? (
            <div className="py-6 text-2xl">
              Thanks for joining this HackList! 🎉
            </div>
          ) : (
            !joinedWhitelist &&
            walletConnected &&
            networkConnected &&
            numberOfWhitelisted == maxWhitelisted && (
              <div className="py-6 text-3xl">
                You&apos;re late for this hack. Unfortunatelly the applications
                are closed 🙁.
              </div>
            )
          )}
          {joinedWhitelist && numberOfWhitelisted < maxWhitelisted && (
            <p className="text-xl">
              We still have{" "}
              <strong>{maxWhitelisted - numberOfWhitelisted}</strong>{" "}
              {maxWhitelisted - numberOfWhitelisted == 1 ? "spot" : "spots"}{" "}
              available.
            </p>
          )}
          {!joinedWhitelist &&
            walletConnected &&
            numberOfWhitelisted < maxWhitelisted && (
              <div className="description text-xl">
                {numberOfWhitelisted == 0 && (
                  <p className="py-4">
                    You&apos;re <span className="italic">The One</span>! No one
                    has joined this HackList yet 😎{" "}
                  </p>
                )}
                {numberOfWhitelisted > 0 && numberOfWhitelisted < 4 && (
                  <p className="py-4">
                    You&quot;re an OG! Only{" "}
                    <strong>{numberOfWhitelisted}</strong>{" "}
                    {numberOfWhitelisted > 1 ? "hackers have" : "hacker has"}{" "}
                    joined this HackList.
                  </p>
                )}
                {numberOfWhitelisted > 3 && (
                  <p className="py-4">
                    <strong>{numberOfWhitelisted}</strong> hackers have joined
                    the HackList.
                  </p>
                )}
                <p>
                  We have{" "}
                  <strong>{maxWhitelisted - numberOfWhitelisted}</strong>{" "}
                  {maxWhitelisted - numberOfWhitelisted == 1 ? "spot" : "spots"}{" "}
                  available. Hurry up!
                </p>
                <Button onClick={addAddressToWhitelist} loading={isSpinnerOn}>
                  Apply now
                </Button>
              </div>
            )}
        </section>
      </div>
      <footer className="mx-10 py-2 text-right self-end align-top border-t border-slate-200 dark:border-slate-700 text-gray-400 dark:text-gray-400 ">
        Made with &#10084; by{" "}
        <span>
          <a href="https://hackshare.xyz">HackShare</a>
        </span>
      </footer>
    </>
  );
}
