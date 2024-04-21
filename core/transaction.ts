import { BlockhashWithExpiryBlockHeight, ComputeBudgetProgram, Connection, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import base58 from "bs58";
import { wait } from "@/core/time";
import { clamp } from "@/core/interval";

export type TransactionStep = "preparing" | "signing" | "sending" | "confirming";
export type ProgressHandler = (step: TransactionStep, expiry: number) => void;

const maxPriorityFee = 1_000_000; // 0.001 SOL
const priorityFeePercentile = 0.9;
const maxComputeLimit = 1_400_000;
const computeLimitMargin = 0.1;
const minComputeLimitMargin = 25_000;
const retryInterval = 2000;
const progressInterval = 1000;
const expiryTimeInBlocks = 300;

async function getComputeLimitSuggestion(connection: Connection, instructions: Array<TransactionInstruction>): Promise<number> {
  try {
    const transactionMessage = new TransactionMessage({
      instructions,
      payerKey: PublicKey.default,
      recentBlockhash: PublicKey.default.toBase58(),
    }).compileToV0Message();

    const transaction = new VersionedTransaction(transactionMessage);

    const simulation = await connection.simulateTransaction(transaction, { sigVerify: false, replaceRecentBlockhash: true });
    if (!simulation.value.unitsConsumed) {
      throw new Error("Failed to simulate transaction");
    }

    const marginUnits = Math.max(minComputeLimitMargin, computeLimitMargin * simulation.value.unitsConsumed);
    const estimatedUnits = Math.ceil(simulation.value.unitsConsumed + marginUnits);
    return Math.min(maxComputeLimit, estimatedUnits);
  } catch {
    return maxComputeLimit;
  }
}

async function getComputePriceSuggestion(connection: Connection, instructions: Array<TransactionInstruction>, computeLimit: number): Promise<number> {
  const lockedWritableAccounts = instructions
    .flatMap(instruction => instruction.keys)
    .filter(key => key.isWritable)
    .map(key => key.pubkey);

  const recentPriorityFees = await connection.getRecentPrioritizationFees({
    lockedWritableAccounts,
  });

  const sortedPriorityFees = recentPriorityFees
    .sort((a, b) => a.prioritizationFee - b.prioritizationFee);
  if (sortedPriorityFees.length === 0) {
    return 0;
  }
  const percentileIndex = Math.floor(sortedPriorityFees.length * priorityFeePercentile);
  const estimatedPrice = sortedPriorityFees[percentileIndex].prioritizationFee;
  const maxPrice = Math.floor(maxPriorityFee * 1_000_000 / computeLimit);

  return Math.min(estimatedPrice, maxPrice);
}

export class TransactionError extends Error {
  constructor(
    public readonly error: string | {},
    public readonly programLogs: Array<string> | null = null,
    public readonly isSimulation: boolean = false,
  ) {
    super(`${isSimulation ? "Simulation" : "Transaction"} failed: ${JSON.stringify(error)}`);
  }
}

export interface SendAndConfirmTransactionProps {
  connection: Connection;
  instructions: Array<TransactionInstruction>;
  payer: PublicKey;
  signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>;
  progress?: ProgressHandler;
}

export async function sendAndConfirmTransaction(props: SendAndConfirmTransactionProps): Promise<string> {
  let state: TransactionStep = "preparing";
  let block: BlockhashWithExpiryBlockHeight | null = null;
  const abortController = new AbortController();

  if (props.progress != null) {
    new Promise<void>(async resolve => {
      while (!abortController.signal.aborted) {
        let progress = 1;
        if (block != null) {
          const blockheight = await props.connection.getBlockHeight();
          const remainingBlockheight = block.lastValidBlockHeight - blockheight;
          progress = clamp(remainingBlockheight / expiryTimeInBlocks, 0, 1);
        }
        props.progress?.(state, progress);
        await wait(progressInterval);
      }
      resolve();
    });
  }

  try {
    const computeLimit = await getComputeLimitSuggestion(props.connection, props.instructions);
    const computePrice = await getComputePriceSuggestion(props.connection, props.instructions, computeLimit);
    const computeBudgetInstructions = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: computeLimit }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: computePrice }),
    ];
    block = await props.connection.getLatestBlockhash();
    const transactionMessage = new TransactionMessage({
      instructions: [...computeBudgetInstructions, ...props.instructions],
      payerKey: props.payer,
      recentBlockhash: block.blockhash,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(transactionMessage);

    state = "signing";
    const signedTransaction = await props.signTransaction(transaction);
    state = "sending";
    const simulation = await props.connection.simulateTransaction(signedTransaction);
    const signature = base58.encode(signedTransaction.signatures[0]);

    if (simulation.value.err != null) {
      throw new TransactionError(simulation.value.err, simulation.value.logs, true);
    }

    state = "confirming";
    const confirmTransactionPromise = props.connection.confirmTransaction({ ...block, signature, abortSignal: abortController.signal });

    while (true) {
      await props.connection.sendTransaction(signedTransaction, {
        skipPreflight: true,
        maxRetries: 0,
      });

      const confirmedTransaction = await Promise.race([
        confirmTransactionPromise,
        wait(retryInterval),
      ]);

      if (confirmedTransaction == null) {
        continue;
      }

      if (confirmedTransaction.value.err) {
        const txInfo = await props.connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
        throw new TransactionError(confirmedTransaction.value.err, txInfo?.meta?.logMessages);
      }

      return signature;
    }
  } finally {
    abortController.abort();
  }
}

