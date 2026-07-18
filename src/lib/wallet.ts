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

// Addresses are stored lowercase; normalise every lookup so checksummed
// (mixed-case) addresses pasted from MetaMask/Etherscan still match.
const normalize = (a: string): string => a.trim().toLowerCase();

// Whether an account is registered for this address in the local store.
export async function accountExists(address: string): Promise<boolean> {
  return !!all()[normalize(address)];
}

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

// Maximum mean per-landmark distance for two face vectors to count as the
// same person. MediaPipe landmarks are normalised to [0,1], so same-face
// captures land well under this while different faces drift above it.
const FACE_MATCH_THRESHOLD = 0.08;

// Compare a live capture against the face vector saved with the user's
// account. Returns false when the user has no account / saved vector.
export async function verifyFace(uid: string, liveVector: number[]): Promise<boolean> {
  const rec = Object.values(all()).find((r) => r.ownerUid === uid);
  const saved = rec?.faceVector;
  if (!saved || saved.length === 0 || saved.length !== liveVector.length) return false;

  // Mean Euclidean distance across the 468 [x,y,z] landmarks.
  let total = 0;
  const points = saved.length / 3;
  for (let i = 0; i < saved.length; i += 3) {
    const dx = saved[i] - liveVector[i];
    const dy = saved[i + 1] - liveVector[i + 1];
    const dz = saved[i + 2] - liveVector[i + 2];
    total += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  return total / points <= FACE_MATCH_THRESHOLD;
}

// Move funds from the sender's account to the receiver address. Both accounts
// must exist in the local store; the face match is checked by the caller.
export async function sendTransaction(params: {
  fromUid: string;
  toAddress: string;
  amount: number;
}): Promise<Account> {
  const toAddress = normalize(params.toAddress);
  if (!isValidAddress(toAddress)) {
    throw new Error("That receiver address is not a valid wallet address.");
  }
  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }

  const records = all();
  const from = Object.values(records).find((r) => r.ownerUid === params.fromUid);
  if (!from) throw new Error("You don't have an account yet.");
  const to = records[toAddress];
  if (!to) throw new Error("No account exists for that receiver address.");
  if (to.address === from.address) throw new Error("You can't send funds to yourself.");
  if (params.amount > from.balance) throw new Error("Insufficient balance.");

  from.balance = Math.round((from.balance - params.amount) * 100000) / 100000;
  to.balance = Math.round((to.balance + params.amount) * 100000) / 100000;
  save(records);

  return toAccount(from);
}

// One-time account creation: stores the MetaMask address, the captured face
// vector, and the seed balance. Fails if the user already has an account or the
// address is already registered by anyone.
export async function createAccount(params: {
  uid: string;
  address: string;
  faceVector?: number[];
}): Promise<Account> {
  const address = normalize(params.address);
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
