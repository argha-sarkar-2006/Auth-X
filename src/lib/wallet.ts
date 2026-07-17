import { readKey, writeKey } from "./localdb";
import { mergeProfile } from "./profile";

// Every new account is seeded with this Sepolia testnet balance.
export const DEFAULT_BALANCE = 20.35;

// An account. The wallet address is the unique key in the local `accounts`
// store — no two users can register the same address. USD value is always 0
// because this is a testnet.
export interface Account {
  address: string;
  ownerUid: string;
  balance: number;
  hasFaceVector: boolean;
}

interface AccountRecord {
  address: string;
  ownerUid: string;
  balance: number;
  faceVector: number[];
  createdAt: number;
}

const ACCOUNTS_KEY = "accounts";
const HEX_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export const isValidAddress = (a: string): boolean => HEX_ADDRESS.test(a.trim());

function all(): Record<string, AccountRecord> {
  return readKey<Record<string, AccountRecord>>(ACCOUNTS_KEY, {});
}
function save(records: Record<string, AccountRecord>): void {
  writeKey(ACCOUNTS_KEY, records);
}
function toAccount(r: AccountRecord): Account {
  return {
    address: r.address,
    ownerUid: r.ownerUid,
    balance: r.balance,
    hasFaceVector: r.faceVector.length > 0,
  };
}

// Look up the account owned by a user, if they have created one. Async so the
// call sites (which awaited Firestore) keep working unchanged.
export async function getMyAccount(uid: string): Promise<Account | null> {
  const rec = Object.values(all()).find((r) => r.ownerUid === uid);
  return rec ? toAccount(rec) : null;
}

// One-time account creation: stores the MetaMask address, the captured face
// vector, and the seed balance. Fails if the user already has an account or the
// address is already registered by anyone.
export async function createAccount(params: {
  uid: string;
  address: string;
  faceVector?: number[];
}): Promise<Account> {
  const address = params.address.trim();
  if (!isValidAddress(address)) {
    throw new Error("MetaMask returned an invalid wallet address.");
  }

  const records = all();
  if (Object.values(records).some((r) => r.ownerUid === params.uid)) {
    throw new Error("You already have an account.");
  }
  if (records[address]) {
    throw new Error("That wallet address is already registered.");
  }

  const faceVector = params.faceVector ?? [];
  const record: AccountRecord = {
    address,
    ownerUid: params.uid,
    balance: DEFAULT_BALANCE,
    faceVector,
    createdAt: Date.now(),
  };
  records[address] = record;
  save(records);
  // Link the account to the user's profile for easy lookup.
  mergeProfile(params.uid, { accountAddress: address });

  return toAccount(record);
}
