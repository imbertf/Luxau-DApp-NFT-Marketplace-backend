const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LuxauNFTModule", (m) => {

  const luxauNFT = m.contract("LuxauNFT");

  return { luxauNFT };
});
