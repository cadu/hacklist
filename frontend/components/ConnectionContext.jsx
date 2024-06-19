import { useRef, useCallback, useContext, createContext, useState, useEffect } from "react";
import { ethers, providers, Contract } from "ethers";
import Web3Modal from "web3modal";
import { SpinnerContext } from "../context/SpinnerContext";

const ConnectionContext = createContext();

const ConnectionContextProvider = (props) => {
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [chainId, setChainId] = useState();
  const { setIsSpinnerOn } = useContext(SpinnerContext);
  const web3ModalRef = useRef();

  const getProvider = async () => {
    try {
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      setIsSpinnerOn(true);
      const provider = await web3ModalRef.current.connect();

      provider.on("chainChanged", (newChainId) => {
        setChainId(parseInt(newChainId));
      });
      setWalletConnected(true);
      const web3Provider = new providers.Web3Provider(provider);
      // console.log(web3Provider);
      // If user is not connected to the right network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      setChainId(chainId);
      setIsSpinnerOn(false);
      
      // The "any" network will allow spontaneous network changes
      const anyNetworkProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
      anyNetworkProvider.on("network", (newNetwork, oldNetwork) => {
          // When a Provider makes its initial connection, it emits a "network"
          // event with a null oldNetwork along with the newNetwork. So, if the
          // oldNetwork exists, it represents a changing network
          if (oldNetwork) {
              window.location.reload();
          }
      });

      return web3Provider;
    } catch (error) {
      if (error.code == 4001) {
        throw new Error("Please connect your wallet!");
      } else {
        console.log(error.message);
      }
      setIsSpinnerOn(false);
    }
  }

  const connectWallet = useCallback(async () => {
    const web3Provider = await getProvider();
    if (web3Provider) {
      setWeb3Provider(web3Provider);
      const { chainId } = await web3Provider.getNetwork();
      setChainId(chainId);
    }
  }, []);

  const changeNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
                    chainId: "0xAA36A7",
                    rpcUrls: ["https://sepolia.infura.io/v3/"],
                    chainName: "Sepolia",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH", // 2-6 characters long
                      decimals: 18,
                    },
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  }]
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
  
  useEffect(() => {
    connectWallet();
  }, []);

  return (
    // the Provider gives access to the context to its children
    <ConnectionContext.Provider value={{ 
      web3Provider,
      connectWallet,
      walletConnected,
      chainId,
      changeNetwork
    }}>
      {props.children}
    </ConnectionContext.Provider>
  );
};
const useConnectionContext = () => useContext(ConnectionContext);

export { useConnectionContext, ConnectionContextProvider };