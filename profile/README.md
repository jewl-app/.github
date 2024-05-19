Jewl is a platform that allows you to create specialized non-fungible tokens that wrap your fungible on-chain tokens using NFTs. The way this works is simple:

You can create a new token using the `initializeAllocation` instruction. You can then add tokens to the NFT using the `increaseAllocation` instruction, specifying the amount of tokens you'd like to add to the NFT.

If for some reason you'd like to remove tokens from the NFT (if you have set the `decreaseAuthority`), you can do so by calling the `decreaseAllocation` instruction. This will decrease the allocation of the NFT by the tokens specified.

At any time you can calculate the value of the NFT by summing the value of the tokens allocated to it. If at any point you'd like to exercise the NFT for the tokens allocated to it, you can do so by calling the `exerciseAllocation` instruction.

The owner of the NFT is free to transfer the NFT to any wallet they'd like. This means that the owner of the NFT can transfer the NFT to another wallet or sell the allocation to a third party if they so wish. Transferring of the NFT can be done using the `transferAllocation` instruction.

***Nothing in this document constitutes as tax or legal advice. Consult with a tax professional before using the jewl platform.***

*Copyright © 2024 jewl*
