// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

// Imports
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
        IERC721 NFTAddress;
        address payable seller;
        uint256 id;
        uint256 price;
        string brandName;
        string description;
        bool isSold;
    }

    /*************************************
    *             Variables              *
    **************************************/
    mapping(address => Brand) public registeredBrands;
    mapping(address => Client) public registeredClients;
    mapping(address => mapping (uint256 => NFT)) public brandNFTs;
    mapping(address => mapping (uint256 => NFT)) public clientNFTs;

    uint256 NFT_CREATION_PRICE = 1;
    uint256 public totalTokens = 0;

    /*************************************
    *              Events                *
    **************************************/
    event BrandRegistered(address brandAddress);
    event ClientRegistered(address clientAddress);
    event NFTCreated(address brandAddress, uint256 tokenId, uint256 price, string brandName, string description); 
    event NFTSold(address from, address to, uint256 id, uint256 price, bool isSold); 

    /*************************************
    *             Constructor            *
    **************************************/
    /// @notice Starts the Ownable pattern and add Owner in registered Brands whitelist
    constructor() payable Ownable(msg.sender) {
        registeredBrands[msg.sender].brandAddress = msg.sender;
        registeredBrands[msg.sender].brandName = "Luxau Lifestyle Elegance";
        registeredBrands[msg.sender].isRegistered = true;
    }

    /*************************************
     *             Modifiers              *
     **************************************/
    /// @notice Checks if the given address belongs to the brands whitelist
    modifier onlyBrand() {
        require(registeredBrands[msg.sender].isRegistered,"You have to be a registered Brand");
        _;
    }

    /// @notice Checks if the given address belongs to the clients whitelist
    modifier onlyClient() {
        require(registeredClients[msg.sender].isRegistered,"You have to be a registered Client");
        _;
    }

    /*************************************
     *             Functions              *
     **************************************/

    /**
     * @notice This function allows a registered brand to create an ERC721 NFT and list it on the LuxauMarketplace.
     * The NFT will be transferred from the caller's address to this contract's address after creation.
     * Only brands are allowed to use this function.
     * @dev This function is payable, meaning that ETH should be sent along with the transaction in order to create an NFT.
     * The minimum required amount of ETH for a successful transaction depends on the contract's `NFT_CREATION_PRICE` variable,
     * which is currently set to 1 ETH. If not enough ETH was sent with the transaction, the function will fail.
     * @param _NFTAddress The address of the ERC721 contract for the NFT that should be created.
     * @param _tokenId The id of the NFT that should be created. This needs to be a unique number within the scope of this contract and not already used by another NFT.
     * @param _price The price at which the NFT should be sold. This is in wei (smallest denomination of ETH).
     * @param _description A description of the NFT.
     */
    function createNFT(IERC721 _NFTAddress, uint256 _tokenId, uint256 _price, string memory _description) 
        external 
        payable 
        onlyBrand 
        nonReentrant 
    {
        require(msg.value >= NFT_CREATION_PRICE, "Minimal price is 1 ETH to create NFT");


        NFT memory newNFT = NFT(
            _NFTAddress,
            payable(msg.sender),
            _tokenId,
            _price,
            registeredBrands[msg.sender].brandName,
            _description,
            false
        );

        brandNFTs[msg.sender][_tokenId] = newNFT;
        totalTokens++;

        _NFTAddress.safeTransferFrom(msg.sender, address(this), _tokenId);

        emit NFTCreated(msg.sender, _tokenId, _price, registeredBrands[msg.sender].brandName, _description);
    }

    /**
     * @notice This function allows a registered client to buy an ERC721 NFT from a specified brand on the LuxauMarketplace. 
     * The NFT will be transferred from this contract's address to the caller's address after purchase.
     * Only clients are allowed to use this function.
     * @dev This function is payable, meaning that ETH should be sent along with the transaction in order to buy an NFT. 
     * The minimum required amount of ETH for a successful transaction depends on the NFT's price which is retrieved from the LuxauMarketplace contract.
     * If not enough ETH was sent with the transaction, the function will fail.
     * @param _brandAddress The address of the brand that owns and lists the NFT. This should be a registered brand in LuxauMarketplace.
     * @param _tokenId The id of the NFT to buy. This is unique within the scope of this contract and not already sold by another client.
     */
    function buyNFT(address _brandAddress, uint256 _tokenId) 
        external 
        payable 
        onlyClient 
        nonReentrant 
    {
        NFT storage nft = brandNFTs[_brandAddress][_tokenId];

        require(_brandAddress != address(0), "Brand address cannot be zero");
        require(nft.seller != address(0), "NFT doesn't exist");
        require(!nft.isSold, "NFT already sold");
        require(msg.value >= nft.price, "Insufficient funds to buy NFT");

        // Mark the NFT as sold
        nft.isSold = true;

        // Add the NFT to clientNFTs mapping
        clientNFTs[msg.sender][_tokenId] = nft;


        // Transfer the NFT to the buyer
        nft.NFTAddress.safeTransferFrom(address(this), msg.sender, _tokenId);

        // Remove the NFT from the brandNFTs mapping
        delete brandNFTs[_brandAddress][_tokenId];
        
        // Transfer funds to the seller
        (bool success, ) = _brandAddress.call{value: msg.value}("");
        require(success, "transfer failed");

        emit NFTSold(nft.seller, msg.sender, nft.id, msg.value, nft.isSold);
    }

    /** @notice
        Adds a Brand and Client to the registeredBrands and registeredClients lists
        Will trigger an error if the address has already been added to the registeredBrands and registeredClients lists
        Only the contract's owner can call this method
        @param _address The address to add to the registeredBrands and registeredClients lists
    */
    function registerBrand(address _address, string memory _brandName) external onlyOwner {
        require(!registeredBrands[_address].isRegistered, "Brand already registered" );

        registeredBrands[_address].brandAddress = _address;
        registeredBrands[_address].brandName = _brandName;
        registeredBrands[_address].isRegistered = true;

        emit BrandRegistered(_address);
    }
    
    /** 
     * @notice Adds a new Client to the registeredClients list.
     * The address of the client must not already be in the registeredClients list.
     * This function can only be called by the contract's owner.
     *
     * @param _address The address of the client to add to the registeredClients lists.
     */
    function registerClient(address _address) external onlyOwner {
        require(!registeredClients[_address].isRegistered, "Client already registered" );

        registeredClients[_address].clientAddress = _address;
        registeredClients[_address].isRegistered = true;
        
        emit ClientRegistered(_address);
    }

    /**
     * @notice This function must be called by an ERC721 contract to indicate that it accepts the transfer of an NFT. 
     * The return value MUST be the bytes4-encoded selector (`IERC721Receiver.onERC721Received(address, address, uint256, bytes)`).
     * @dev This function is called by the operator or a contract to manage the received tokens.
     * @return bytes4 The return value must be the same as `IERC721Receiver.onERC721Received(address, address, uint256, bytes)`. This way it is ensured that the contract implements this interface properly. 
     */
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @dev Returns the current balance of the contract in Wei.
     * Can only be called by the owner of this contract.
     *
     * @return uint256 The current balance of the contract in Wei.
     */
    function contractBalance() external view onlyOwner returns(uint256){
        return address(this).balance;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
