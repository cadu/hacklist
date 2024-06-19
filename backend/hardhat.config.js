require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

// HTTP KEY from your app on Alchemy - https://dashboard.alchemyapi.io/
const ALCHEMY_HTTP_KEY = process.env.ALCHEMY_HTTP_KEY;

// Private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: ALCHEMY_HTTP_KEY,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    // rinkeby: {
    //   url: ALCHEMY_HTTP_KEY,
    //   accounts: [RINKEBY_PRIVATE_KEY],
    // },
    // mumbai: {
    //   url: ALCHEMY_HTTP_KEY,
    //   accounts: [MUMBAI_PRIVATE_KEY],
    // },
  },
};
