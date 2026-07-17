// Minimal MetaMask (EIP-1193) connector. Used once, at account creation, to
// pull the user's wallet address from the browser extension.

interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
}

function getProvider(): Eip1193Provider | null {
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  return eth ?? null;
}

export function isMetaMaskAvailable(): boolean {
  return !!getProvider();
}

// Prompt the user to connect and return their first wallet address.
export async function connectMetaMask(): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error(
      "MetaMask is not installed. Add the MetaMask extension to continue."
    );
  }
  try {
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    if (!accounts || accounts.length === 0) {
      throw new Error("No MetaMask account was returned.");
    }
    return accounts[0];
  } catch (err) {
    const e = err as { code?: number; message?: string };
    if (e.code === 4001) throw new Error("MetaMask connection was rejected.");
    throw new Error(e.message || "Could not connect to MetaMask.");
  }
}
