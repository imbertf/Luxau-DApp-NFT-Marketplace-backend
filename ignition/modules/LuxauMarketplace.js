const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LuxauMarketplaceModule", (m) => {

  const luxauMarketplace = m.contract("LuxauMarketplace");

  return { luxauMarketplace };
});
