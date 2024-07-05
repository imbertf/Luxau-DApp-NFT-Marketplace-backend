// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract LuxauNFT is ERC721Enumerable, Ownable {
    /*************************************
    *             Variables              *
    **************************************/
    using Strings for uint;
    string public baseURI;
    uint256 private _nextTokenId;
    uint256 private constant PRICE_MINT_NFT = 0.0001 ether;



    /*************************************
    *              Events                *
    **************************************/
    event NFTMinted(uint256 tokenId, address from, address to, string tokenURI);



    /*************************************
    *             Constructor            *
    **************************************/
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
    }



    /*************************************
    *             Functions              *
    **************************************/   
    /**
     * @dev Function to mint an NFT.
     * Requires sender send exactly the defined price (0.0001 ETH).
     * Emits an event `NFTMinted` with relevant data upon successful minting.
     */
    function safeMint() external payable {
        require(msg.value >= PRICE_MINT_NFT,"Minimum price to mint is 0.0001 ETH");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        // _setApprovalForAll(msg.sender, 0x09635F643e140090A9A8Dcd712eD6285858ceBef, true);

        emit NFTMinted(tokenId, address(0), msg.sender, baseURI);
    }
     
    /**
     * @dev Returns a URI for a given token ID.
     * 
     * Requirements:
     * - The caller must own the token or be approved to manage the tokens.
     * 
     * Note: This implementation uses `revert()` to consume any excess gas, which should generally only be called in cases where a condition is met that cannot be handled by other means (such as `require()`).
     * 
     * @param _tokenId uint256 ID of the token to query.
     * 
     * @return string URI for the given token ID.
     */
    function tokenURI(uint _tokenId) public view virtual override (ERC721) returns (string memory) {
         _requireOwned(_tokenId);
        return string(abi.encodePacked((baseURI), "/product_", _tokenId.toString(), ".json"));
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