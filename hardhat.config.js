require("@nomiclabs/hardhat-waffle");

const ALCHEMY_API_KEY = "sFOM0wCFLA5nEj2-EiOkMVM4GFM0pDYs";

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY = "d76565a01777631f57827f34235248dff2316f88f1c3e188a8ed307a1d22014e";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
    },
    hardhat: {
      chainId: 31337
    },
  },
};
