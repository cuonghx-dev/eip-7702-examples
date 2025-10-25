import {
  createWalletClient,
  encodeAbiParameters,
  http,
  parseAbi,
  publicActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { modeTestnet } from "viem/chains";

import dotenv from "dotenv";
dotenv.config();

async function main() {
  const SMART_ACCOUNT_ADDRESS = "0x6071F8994Ff59eDaBc7EC309B3b5df1401C85031";
  const EXECUTOR_ADDRESS = "0x9eb59Be2F7D4DEA34a6F8601Dafe46ba40EFD7cA";
  // 1. Set up Client & Account

  const relay = privateKeyToAccount(
    process.env.RELAY_PRIVATE_KEY as `0x${string}`
  );

  const relayWalletClient = createWalletClient({
    account: relay,
    chain: modeTestnet,
    transport: http(),
  }).extend(publicActions);

  // 2. Authorize Contract Designation to Smart Account
  const eoaAccount = privateKeyToAccount(
    process.env.EOA_PRIVATE_KEY as `0x${string}`
  );

  const eoaWalletClient = createWalletClient({
    account: eoaAccount,
    chain: modeTestnet,
    transport: http(),
  });

  const authorization = await eoaWalletClient.signAuthorization({
    executor: "self",
    contractAddress: SMART_ACCOUNT_ADDRESS,
  });

  // // 3. Initialize Smart Account
  // let hash = await eoaWalletClient.writeContract({
  //   abi: parseAbi(["function initializeAccount(address newOwner) external"]),
  //   address: eoaAccount.address,
  //   authorizationList: [authorization],
  //   functionName: "initializeAccount",
  //   args: [eoaAccount.address],
  // });

  // await relayWalletClient.waitForTransactionReceipt({ hash });

  // 3. Install Executor
  // let hash = await eoaWalletClient.writeContract({
  //   abi: parseAbi([
  //     "function installExecutor(address executor, bytes calldata executorData) external",
  //   ]),
  //   address: eoaAccount.address,
  //   authorizationList: [authorization],
  //   functionName: "installExecutor",
  //   args: [
  //     EXECUTOR_ADDRESS,
  //     encodeAbiParameters([{ name: "planId", type: "uint256" }], [1n]),
  //   ],
  // });

  // await relayWalletClient.waitForTransactionReceipt({ hash });
  // 4. Charge
  // recurringExecutor.write.execute([aliceSmartWallet.address, 1000], {
  //   account: executor.account,
  // })
  let hash = await relayWalletClient.writeContract({
    abi: parseAbi(["function execute(address smartAccount) external"]),
    address: EXECUTOR_ADDRESS,
    functionName: "execute",
    args: [eoaAccount.address],
  });

  await relayWalletClient.waitForTransactionReceipt({ hash });
  console.log(`Transaction hash: https://testnet.modescan.io/tx/${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
