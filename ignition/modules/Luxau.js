const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LockModule", (m) => {

  const luxauNFT = m.contract("LuxauNFT");
  const luxauMarketplace = m.contract("LuxauMarketplace");

  return { luxauNFT, luxauMarketplace };
});
