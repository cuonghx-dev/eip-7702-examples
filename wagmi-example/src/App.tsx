import { createWalletClient, encodeAbiParameters, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { modeTestnet } from "viem/chains";
import {
  http,
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient,
  useWriteContract,
} from "wagmi";

const SMART_ACCOUNT_ADDRESS = "0x7d5d7aEb01caA0912A56a055a03eE3DAD5C9b12E";
const EXECUTOR_ADDRESS = "0x9eb59Be2F7D4DEA34a6F8601Dafe46ba40EFD7cA";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const { writeContract } = useWriteContract();

  const subscribe = async (privateKey: `0x${string}`) => {
    if (!walletClient) return;

    const account = privateKeyToAccount(privateKey);
    const eoaWalletClient = createWalletClient({
      account: account,
      chain: modeTestnet,
      transport: http(),
    });
    const authorization = await eoaWalletClient.signAuthorization({
      executor: "self",
      contractAddress: SMART_ACCOUNT_ADDRESS,
    });

    writeContract({
      abi: parseAbi([
        "function installExecutor(address executor, bytes calldata executorData) external",
      ]),
      address: account.address,
      authorizationList: [authorization],
      functionName: "installExecutor",
      args: [
        EXECUTOR_ADDRESS,
        encodeAbiParameters([{ name: "planId", type: "uint256" }], [1n]),
      ],
    });
  };
  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
      <div>
        <h2>Subscribe</h2>
        <button type="button" onClick={() => subscribe()}>
          Subscribe
        </button>
      </div>
    </>
  );
}

export default App;
