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
    using Strings for uint256;
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
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        baseURI = baseURI_;
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
        require(msg.value == PRICE_MINT_NFT, "Minimum price to mint is 0.0001 ETH");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        emit NFTMinted(tokenId, address(0), msg.sender, tokenURI(tokenId));
    }

    /**
     * @dev Returns a URI for a given token ID.
     * 
     * @param tokenId uint256 ID of the token to query.
     * 
     * @return string URI for the given token ID.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, "/product_", tokenId.toString(), ".json"));
    }

    /**
     * @dev Returns the current balance of the contract in Wei.
     * Can only be called by the owner of this contract.
     *
     * @return uint256 The current balance of the contract in Wei.
     */
    function contractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Withdraws all Ether from the contract to the owner's address.
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
