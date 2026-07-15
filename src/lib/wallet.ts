import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore";

// A Sepolia testnet account. The address is the Firestore document id in the
// `accounts` collection, which makes it globally unique — no two users can own
// the same address. USD value is always 0 because this is a testnet.
export interface Account {
  address: string;
  ownerUid: string;
  balance: number;
}

export interface HistoryEntry {
  id: string;
  from: string;
  to: string;
  amount: number;
  participants: string[];
  createdAt: Timestamp | null;
}

const HEX_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function isValidAddress(address: string): boolean {
  return HEX_ADDRESS.test(address.trim());
}

// Look up the account owned by a given user, if they have created one.
export async function getMyAccount(uid: string): Promise<Account | null> {
  const snap = await getDocs(
    query(collection(db, "accounts"), where("ownerUid", "==", uid))
  );
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return {
    address: data.address,
    ownerUid: data.ownerUid,
    balance: data.balance,
  };
}

// One-time account creation. Fails if the user already owns an account or the
// address is already taken by anyone (uniqueness is enforced by the doc id).
export async function createAccount(
  uid: string,
  address: string,
  balance: number
): Promise<Account> {
  const normalized = address.trim();
  if (!isValidAddress(normalized)) {
    throw new Error("Enter a valid address (0x followed by 40 hex characters).");
  }
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error("Enter a valid, non-negative balance.");
  }

  const existing = await getMyAccount(uid);
  if (existing) {
    throw new Error("You already have an account. Address and balance are set once.");
  }

  const ref = doc(db, "accounts", normalized);
  const taken = await getDoc(ref);
  if (taken.exists()) {
    throw new Error("That account address is already in use.");
  }

  const account: Account = { address: normalized, ownerUid: uid, balance };
  await setDoc(ref, { ...account, createdAt: serverTimestamp() });
  return account;
}

// Atomically move Sepolia ETH from the sender to an existing receiver account,
// updating both balances and recording the transfer in one shot.
export async function sendEth(
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<void> {
  const to = toAddress.trim();
  if (!isValidAddress(to)) {
    throw new Error("Enter a valid receiver address.");
  }
  if (to === fromAddress) {
    throw new Error("You cannot send to your own account.");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter an amount greater than 0.");
  }

  const senderRef = doc(db, "accounts", fromAddress);
  const receiverRef = doc(db, "accounts", to);
  const txRef = doc(collection(db, "transactions"));

  await runTransaction(db, async (tx) => {
    const senderSnap = await tx.get(senderRef);
    const receiverSnap = await tx.get(receiverRef);

    if (!senderSnap.exists()) throw new Error("Your account no longer exists.");
    if (!receiverSnap.exists()) {
      throw new Error("No account found for that receiver address.");
    }

    const senderBalance = senderSnap.data().balance as number;
    const receiverBalance = receiverSnap.data().balance as number;

    if (senderBalance < amount) {
      throw new Error("Insufficient balance.");
    }

    tx.update(senderRef, { balance: senderBalance - amount });
    tx.update(receiverRef, { balance: receiverBalance + amount });
    tx.set(txRef, {
      from: fromAddress,
      to,
      amount,
      participants: [fromAddress, to],
      createdAt: serverTimestamp(),
    });
  });
}

// Live-subscribe to the send/receive history for an account. Sorted newest
// first on the client to avoid needing a composite Firestore index.
export function subscribeHistory(
  address: string,
  onChange: (entries: HistoryEntry[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, "transactions"),
    where("participants", "array-contains", address)
  );
  return onSnapshot(
    q,
    (snap) => {
      const entries = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          from: data.from,
          to: data.to,
          amount: data.amount,
          participants: data.participants,
          createdAt: data.createdAt ?? null,
        } as HistoryEntry;
      });
      entries.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onChange(entries);
    },
    (err) => onError?.(err as Error)
  );
}

// Keep an account's balance in sync live (updates when a transfer lands).
export function subscribeAccount(
  address: string,
  onChange: (account: Account | null) => void
): () => void {
  return onSnapshot(doc(db, "accounts", address), (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data();
    onChange({
      address: data.address,
      ownerUid: data.ownerUid,
      balance: data.balance,
    });
  });
}
