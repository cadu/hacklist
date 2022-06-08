import { ethers } from "ethers";
import Web3Modal from "web3modal";

async function ConnectWeb3() {
  const providerOptions = {
    /* See Provider Options Section */
  };
  
  const web3Modal = new Web3Modal({
    network: "rinkeby", // optional
    cacheProvider: true, // optional
    providerOptions // required
  });
  
  const instance = await web3Modal.connect();
  
  const provider = new ethers.providers.Web3Provider(instance);
  const signer = provider.getSigner();

  const getSigner = () => {
    return provider.getSigner();
  }
}
export default ConnectWeb3;