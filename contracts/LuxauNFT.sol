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
    uint256 private constant MINT_PRICE = 10000000000000000 wei;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
    }

    function safeMint() external payable {
        require(msg.value >= MINT_PRICE,"Minimum price to mint is 0.01 ETH");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }
 
    function tokenURI(uint _tokenId) public view virtual override (ERC721) returns (string memory) {
         require(_ownerOf(_tokenId) != address(0), "Token doesn't exist");
        return string(abi.encodePacked((baseURI), "/product_", _tokenId.toString(), ".json"));
    }
}