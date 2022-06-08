require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env"});

// HTTP KEY from your app on Alchemy - https://dashboard.alchemyapi.io/
const ALCHEMY_HTTP_KEY = process.env.ALCHEMY_HTTP_KEY;
// Rinkeby network private key
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: ALCHEMY_HTTP_KEY,
      accounts: [RINKEBY_PRIVATE_KEY]
    }
  }
}