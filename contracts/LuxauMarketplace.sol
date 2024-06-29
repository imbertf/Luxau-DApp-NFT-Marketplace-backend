// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Imports
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LuxauNFT.sol";

// Custom errors
error NFTnotFound(uint256 id, string errorMessage);

contract LuxauMarketplace is Ownable, ReentrancyGuard {

    /*************************************
    *              Structs               *
    **************************************/

    struct Brand {
      address brandAddress;
      string brandName;
      bool isRegistered;
    }

    struct Client {
      address clientAddress;
      bool isRegistered;
    }

    struct NFT {
      address NFTAddress;
      string brandName;
    }


    /*************************************
    *             Variables              *
    **************************************/

    NFT[] NFTArray;
    mapping(address => Brand) registeredBrands;
    mapping(address => Client) registeredClients;
    // address public luxauNFTContractAddress = 0xF896bB1Da84b8dDE7Ca31D79075B56e51Cdd5582;



    /*************************************
    *              Events                *
    **************************************/

    event BrandRegistered(address brandAddress); 
    event ClientRegistered(address clientAddress);
    event NFTSold(address NFTAddress);



    /*************************************
    *             Constructor            *
    **************************************/

    /// @notice Starts the Ownable pattern
    constructor() Ownable(msg.sender) {    }



    /*************************************
    *             Modifiers              *
    **************************************/

    /// @notice Checks if the given address belongs to the brands whitelist
    modifier onlyBrands() {
        require(registeredBrands[msg.sender].isRegistered, "You have to be a registered Brand");
        _;
    }

    /// @notice Checks if the given address belongs to the clients whitelist
    modifier onlyClients() {
        require(registeredClients[msg.sender].isRegistered, "You have to be a registered Client");
        _;
    }




    /*************************************
    *             Functions              *
    **************************************/

    /** @notice
        Adds a Brand and Client to the registeredBrands and registeredClients lists
        Will trigger an error if the address has already been added to the registeredBrands and registeredClients lists
        Only the contract's owner can call this method
    */
    /// @param _address The address to add to the registeredBrands and registeredClients lists

    function registerBrand(address _address) external onlyOwner {
        require(registeredBrands[_address].isRegistered != true, 'Brand already registered');
    
        registeredBrands[_address].isRegistered = true;
        emit BrandRegistered(_address);
    }

    function registerClient(address _address) external onlyOwner {
        require(registeredClients[_address].isRegistered != true, 'Client already registered');
    
        registeredClients[_address].isRegistered = true;
        emit ClientRegistered(_address);
    }

    /** @notice 
        Get a brand or client by his address
        Trigger an error if this address isn't registered
        Only the contract's owner can call this method
    */
    /// @return Brand The brand corresponding to the given address
    function getBrand(address _address) external onlyOwner view returns (Brand memory) {
      require(registeredBrands[_address].isRegistered, "Brand is not registered");
        return registeredBrands[_address];
    }

    /// @return Client The client corresponding to the given address
    function getClient(address _address) external onlyOwner view returns (Client memory) {
      require(registeredClients[_address].isRegistered, "Client is not registered");
        return registeredClients[_address];
    }


    /** @notice 
        Get an NFT from the given id
        Revert with custom error if NFT doesn't exist
    */
    function getOneNFT(uint256 _id) external view returns (NFT memory) {
      if (_id >= NFTArray.length) {
        revert NFTnotFound({id : _id, errorMessage: "NFT with this ID does not exist"});
      }
      return NFTArray[_id];
    }

    /** @notice 
        Get all NFTs minted by the LuxauNFT contract and owned by the marketplace
    */
    // function getAllNFT() external view returns (string memory) {
    //     LuxauNFT luxauNFTContract = LuxauNFT(luxauNFTContractAddress);
    //     return luxauNFTContract.getTokensOfOwner();
    // }
    // function getAllNFT() external view returns (uint256[] memory) {
    //     LuxauNFT luxauNFTContract = LuxauNFT(luxauNFTContractAddress);
    //     return luxauNFTContract.getTokensOfOwner(address(this));
    // }

      // Fallback function to receive ETH
    receive() external payable {}
}