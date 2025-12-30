// @ts-ignore
import * as SQLite from 'expo-sqlite';
import { StockItem } from '../types';

const dbName = 'inventory.db';

// Initialize database
export const initDB = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      color TEXT NOT NULL,
      ageGroup TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      lastUpdated TEXT NOT NULL
    );
  `);
  return db;
};

// Get all items
export const getItems = async (): Promise<StockItem[]> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const allRows = await db.getAllAsync('SELECT * FROM items ORDER BY lastUpdated DESC');
  return allRows as StockItem[];
};

export const getAllItems = (): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabaseAsync(dbName);
      const rows = await db.getAllAsync('SELECT * FROM items');
      console.log('Fetched items for export now :', rows);
      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
};


// Add new item
export const addItem = async (
  category: string,
  color: string,
  ageGroup: string,
  quantity: number
): Promise<number> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const lastUpdated = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO items (category, color, ageGroup, quantity, lastUpdated) VALUES (?, ?, ?, ?, ?)',
    category,
    color,
    ageGroup,
    quantity,
    lastUpdated
  );
  return result.lastInsertRowId;
};

// Update item details
export const updateItem = async (
  id: number,
  category: string,
  color: string,
  ageGroup: string,
  quantity: number
): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const lastUpdated = new Date().toISOString();
  await db.runAsync(
    'UPDATE items SET category = ?, color = ?, ageGroup = ?, quantity = ?, lastUpdated = ? WHERE id = ?',
    category,
    color,
    ageGroup,
    quantity,
    lastUpdated,
    id
  );
};

// Update quantity only (Quick Sell)
export const updateQuantity = async (id: number, newQuantity: number): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const lastUpdated = new Date().toISOString();
  await db.runAsync(
    'UPDATE items SET quantity = ?, lastUpdated = ? WHERE id = ?',
    newQuantity,
    lastUpdated,
    id
  );
};

// Delete item
export const deleteItem = async (id: number): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
};
