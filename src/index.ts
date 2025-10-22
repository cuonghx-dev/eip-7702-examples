import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { modeTestnet } from "viem/chains";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const DELEGATE_CONTRACT_ADDRESS =
    "0xFCD7954D6e854992c35F9eecb95C6F1b30E3f71C";
  // 2. Set up Client & Account
  //  - Next, we will need to set up a Client and a "Relay Account" that will be responsible for executing the EIP-7702 Contract Write.

  const relay = privateKeyToAccount(
    process.env.RELAY_PRIVATE_KEY as `0x${string}`
  );

  const walletClient = createWalletClient({
    account: relay,
    chain: modeTestnet,
    transport: http(),
  });

  // 3. Authorize Contract Designation
  // We will need to sign an Authorization to designate the Contract to the Account.

  // In the example below, we are instantiating an existing EOA (account) and using it to sign the Authorization – this will be the Account that will be used for delegation.
  const eoaAccount = privateKeyToAccount(
    process.env.EOA_PRIVATE_KEY as `0x${string}`
  );

  const authorization = await walletClient.signAuthorization({
    account: eoaAccount,
    contractAddress: DELEGATE_CONTRACT_ADDRESS,
  });

  // 4. Execute Contract Write
  // We can now designate the Contract on the Account (and execute the initialize function) by sending an EIP-7702 Contract Write.
  const hash = await walletClient.writeContract({
    abi: parseAbi(["function initialize() external"]),
    address: eoaAccount.address,
    authorizationList: [authorization],
    //                  ↑ 3. Pass the Authorization as a parameter.
    functionName: "initialize",
  });

  console.log(`Transaction hash: https://sepolia.basescan.org/tx/${hash}`);

  //   5. (Optional) Interact with the Delegated Account
  // Now that we have designated a Contract onto the Account, we can interact with it by invoking its functions.

  // Note that we no longer need to use an Authorization!

  // const hash = await walletClient.writeContract({
  //   abi: parseAbi(["function ping() external"]),
  //   address: eoaAccount.address,
  //   functionName: "ping",
  // });

  console.log(`Transaction hash: https://testnet.modescan.io/tx/${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
