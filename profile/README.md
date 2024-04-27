If you live in a country where capital gains are taxed at a lower tax rate than income (Canada...), you get heavily taxed on bonuses and equity allocations. If somehow you could turn your bonuses and equity allocations into something that falls in the capital gains category, you could save a lot of money on taxes.

Jewl is a platform that allows you to create specialized non-fungible tokens that represent your bonuses and equity allocations (given they are also on-chain tokens). The way this works is simple:

Instead of receiving your bonuses and/or equity at set intervals you receive a special NFT on signing. This token initially has very little to no value given that it does not represent anything and is not backed by anything. You can create a new token using the `initializeAllocation` instruction.

We recomend that you initially add a small amount of value to this token by sending some other token to it. This will prevent the NFT from having no value. e.g. you could send 1 USDC to the token which gives the NFT a value of 1 USDC. On your tax return you then report this 1 USDC as income.

The jewl program allows the owner of the NFT to always exercise it for the tokens allocated to this NFT. This means that the NFT is always worth the value of the tokens allocated to it. To allocate more tokens to the NFT you can call the `increaseAllocation` instruction. This will increase the allocation of the NFT by the tokens specified.

At any time you can calculate the value of the NFT by summing the value of the tokens allocated to it. If at any point you'd like to exercise the NFT for the tokens allocated to it, you can do so by calling the `exerciseAllocation` instruction. Depending on the jurisdiction exercising the allocation might be considered a taxable employment benefit. In that instance you'd have to sell the NFT instead of exercising for it to be considered a capital gain.

If for some reason you'd like to decrease the allocation of the NFT (if you have set the `decreaseAuthority`), you can do so by calling the `decreaseAllocation` instruction. This will decrease the allocation of the NFT by the tokens specified.

The owner of the NFT is free to transfer the NFT to any wallet they'd like. This means that the owner of the NFT can transfer the NFT to another wallet or sell the allocation to a third party if they so wish. Transferring of the NFT can be done using the `transferAllocation` instruction. These special NFTs cannot be transferred directly because they are frozen to prevent accidental burning of the NFT (which would result in the loss of the tokens allocated to it).

## Example

Let's say you receive an equity allocation of 1000 X tokens every year. For simplicity, in this example the X token is always worth 10 USDC. If you were to receive this equity allocation yearly you would have to report 10,000 USDC as bonus income every year. If bonus income is taxed at 50% you would have to pay 5000 USDC in added taxes every year.

If you were to receive a jewl NFT instead on signing you would only have to report the value of the NFT as income (negligible). At the end of the year the 1000 X tokens would be assigned to the NFT increasing the value of the NFT to 10,000 USDC. If you were to exchange the NFT for the 1000 X tokens you would have to report the capital gains on the 10,000 USDC as income. If capital gains are taxed at 25% you would only have to pay 2500 USDC in added taxes, allowing you to retain 7500 USDC.

***Nothing in this document constitutes as tax or legal advice. Consult with a tax attourney before using the jewl platform.***

*Copyright © 2024 jewl*
