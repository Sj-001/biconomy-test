//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
// import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// OR MyContract is ERC2771Context
contract MyContract is ERC2771Context, Ownable{
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdTracker;

    address public trustedForwarder;
    /** 
     * Set the trustedForwarder address either in constructor or 
     * in other init function in your contract
     */ 
// OR constructor(address _trustedForwarder) public ERC2771Context(_trustedForwarder)
    constructor(address _trustedForwarder)  ERC2771Context(_trustedForwarder){
        trustedForwarder = _trustedForwarder;
    }

    function _msgSender() internal view  override(ERC2771Context, Context) returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view  override(ERC2771Context, Context) returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }


    function increment() external {
        _tokenIdTracker.increment();
    }

    function returnCounter() external view returns(uint){
        return _tokenIdTracker.current();
    }
    
  
    
    /**
     * OPTIONAL
     * You should add one setTrustedForwarder(address _trustedForwarder)
     * method with onlyOwner modifier so you can change the trusted
     * forwarder address to switch to some other meta transaction protocol
     * if any better protocol comes tomorrow or the current one is upgraded.
     */
    
    /** 
     * Override this function.
     * This version is to keep track of BaseRelayRecipient you are using
     * in your contract. 
     */
    // function versionRecipient() external view override returns (string memory) {
    //     return "1";
    // }
}