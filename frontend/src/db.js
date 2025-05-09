// src/db.js
import { openDB } from 'idb';

const DB_NAME = 'chat-db';
const STORE_NAME = 'messages';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveMessage(msg) {
  const db = await getDB();
  await db.add(STORE_NAME, msg);
}

export async function getAllMessages() {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

export async function clearMessages() {
  const db = await getDB();
  return await db.clear(STORE_NAME);
}
