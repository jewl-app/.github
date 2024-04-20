// import { allocationAddress, feeConfigAddress, tokenExtensionsProgramId } from "@/core/address";
// import { createUpdateAllocationInstruction } from "@/core/instruction";
// import { Keypair, PublicKey } from "@solana/web3.js";
// import { signerAddress, startTestRunner, setFeeConfig, setTokenMint, setAllocation, testTransaction, getAllocation } from "@/tests/program";
// import assert from "assert";


// describe("update_allocation", () => {
//   const nftMintAddress = Keypair.generate().publicKey;
//   const newAuthority = Keypair.generate().publicKey;
//   const nftAllocationAddress = allocationAddress(nftMintAddress);
//   const instruction = (props?: { renounce?: boolean }) => createUpdateAllocationInstruction({
//     payer: signerAddress,
//     nftMint: nftMintAddress,
//     authority: (props?.renounce ?? false) ? null : newAuthority,
//   });

//   beforeEach(async () => {
//     await startTestRunner();
//     await setFeeConfig({});
//     await setTokenMint({
//       address: nftMintAddress,
//       authority: feeConfigAddress,
//       programId: tokenExtensionsProgramId
//     });

//   });

//   it("Should be able to update the decrease authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       decreaseAuthority: signerAddress,
//     });
//     await testTransaction([instruction()]);
//     const allocation = await getAllocation(nftAllocationAddress);
//     assert.strictEqual(allocation.decreaseAuthority.toBase58(), newAuthority.toBase58());
//     assert.strictEqual(allocation.recoverAuthority.toBase58(), PublicKey.default.toBase58());
//   });

//   it("Should be able to renounce the decrease authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       decreaseAuthority: signerAddress,
//     });
//     await testTransaction([instruction({ renounce: true })]);
//     const allocation = await getAllocation(nftAllocationAddress);
//     assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
//     assert.strictEqual(allocation.recoverAuthority.toBase58(), PublicKey.default.toBase58());
//   });

//   it("Should be able to update the recover authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       recoverAuthority: signerAddress,
//     });
//     await testTransaction([instruction()]);
//     const allocation = await getAllocation(nftAllocationAddress);
//     assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
//     assert.strictEqual(allocation.recoverAuthority.toBase58(), newAuthority.toBase58());
//   });

//   it("Should be able to renounce the recover authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       recoverAuthority: signerAddress,
//     });
//     await testTransaction([instruction({ renounce: true })]);
//     const allocation = await getAllocation(nftAllocationAddress);
//     assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
//     assert.strictEqual(allocation.recoverAuthority.toBase58(), PublicKey.default.toBase58());
//   });

//   it("Should fail if neither the recover nor decrease authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       decreaseAuthority: newAuthority,
//       recoverAuthority: newAuthority,
//     });
//     await assert.rejects(testTransaction([instruction()]));
//   });

//   it("Should not be able to update a renounced decrease authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       recoverAuthority: newAuthority,
//     });
//     await assert.rejects(testTransaction([instruction()]));
//   });

//   it("Should not be able to update a renounced recover authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       decreaseAuthority: newAuthority,
//     });
//     await assert.rejects(testTransaction([instruction()]));
//   });

//   it("Should not be able to set the recover authority to the decrease authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       recoverAuthority: signerAddress,
//       decreaseAuthority: newAuthority,
//     });
//     const promise = testTransaction([instruction()]);
//     await assert.rejects(promise);
//   });

//   it("Should not be able to set the decrease authority to the recover authority", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       recoverAuthority: newAuthority,
//       decreaseAuthority: signerAddress,
//     });
//     const promise = testTransaction([instruction()]);
//     await assert.rejects(promise);
//   });

//   it("Should not be able to update an uninitialized allocation", async () => {
//     await setAllocation({
//       initialized: false,
//       nftMint: nftMintAddress,
//       decreaseAuthority: signerAddress,
//     });
//     const promise = testTransaction([instruction()]);
//     await assert.rejects(promise);
//   });

//   it("Should not be able to update an authority with an uninitialized fee config", async () => {
//     await setAllocation({
//       nftMint: nftMintAddress,
//       decreaseAuthority: signerAddress,
//     });
//     await setFeeConfig({ initialized: false });
//     const promise = testTransaction([instruction()]);
//     await assert.rejects(promise);
//   });

// });
