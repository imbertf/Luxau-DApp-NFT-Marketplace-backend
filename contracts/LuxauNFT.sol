// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LuxauNFT is ERC721Enumerable, Ownable {
    using Strings for uint;
    string public baseURI;
    uint256 private _nextTokenId;
    uint256 private constant PRICE_MINT_NFT = 10000000000000000 wei;

    constructor()
        ERC721("Luxau", "LAU")
        Ownable(msg.sender)
    {
    }

    function safeMint() external payable {
        require(msg.value == PRICE_MINT_NFT,"Minimum price to mint is 0.01 ETH");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }
 
    function tokenURI(uint _tokenId) public view virtual override (ERC721) returns (string memory) {
         require(_ownerOf(_tokenId) != address(0), "Token doesn't exist.");
        return string(abi.encodePacked((baseURI), "/product_", _tokenId.toString(), ".json"));
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

   
    // function getTokensOfOwner() pure view returns (string memory) {
    //     string memory message = "hello !";
    //     return message;
    // }
    // function getTokensOfOwner(address owner) external view returns (uint256[] memory) {
    //     uint256 tokenCount = balanceOf(owner);
    //     uint256[] memory tokenIds = new uint256[](tokenCount);
    //     for (uint256 i = 0; i < tokenCount; i++) {
    //         tokenIds[i] = tokenOfOwnerByIndex(owner, i);
    //     }
    //     return tokenIds;
    // }
}