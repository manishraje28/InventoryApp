// @ts-ignore
import * as SQLite from 'expo-sqlite';
import { StockItem, SaleRecord } from '../types';

const dbName = 'inventory.db';

// Initialize database with safe migrations
export const initDB = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);

  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      subCategory TEXT,
      color TEXT NOT NULL,
      ageGroup TEXT NOT NULL,
      price REAL,
      quantity INTEGER NOT NULL,
      lastUpdated TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(itemId) REFERENCES items(id)
    );
  `);

  // Migration: Add new columns if they are missing from existing `items` table
  // There is no direct "IF COLUMN NOT EXISTS" in SQLite for ALTER TABLE, so we can try-catch or check `pragma table_info`
  // A simple robust way for this environment is to try adding the columns and ignore errors if they exist.
  try {
    await db.execAsync(`ALTER TABLE items ADD COLUMN subCategory TEXT;`);
  } catch (e) { /* Column likely exists */ }

  try {
    await db.execAsync(`ALTER TABLE items ADD COLUMN price REAL;`);
  } catch (e) { /* Column likely exists */ }

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
      // Join items with sales to calculate total sold quantity and revenue
      const rows = await db.getAllAsync(`
        SELECT 
            items.*, 
            COALESCE(SUM(sales.quantity), 0) as soldQuantity,
            COALESCE(SUM(sales.total), 0) as soldRevenue
        FROM items 
        LEFT JOIN sales ON items.id = sales.itemId 
        GROUP BY items.id
      `);
      console.log('Fetched items with sales for export:', rows);
      resolve(rows);
    } catch (error) {
      console.error("Export Query Error", error);
      reject(error);
    }
  });
};


// Add new item
export const addItem = async (
  category: string,
  subCategory: string,
  color: string,
  ageGroup: string,
  price: number,
  quantity: number
): Promise<number> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const lastUpdated = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO items (category, subCategory, color, ageGroup, price, quantity, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?)',
    category,
    subCategory,
    color,
    ageGroup,
    price,
    quantity,
    lastUpdated
  );
  return result.lastInsertRowId;
};

// Update item details
export const updateItem = async (
  id: number,
  category: string,
  subCategory: string,
  color: string,
  ageGroup: string,
  price: number,
  quantity: number
): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const lastUpdated = new Date().toISOString();
  await db.runAsync(
    'UPDATE items SET category = ?, subCategory = ?, color = ?, ageGroup = ?, price = ?, quantity = ?, lastUpdated = ? WHERE id = ?',
    category,
    subCategory,
    color,
    ageGroup,
    price,
    quantity,
    lastUpdated,
    id
  );
};

// Update quantity only (Quick Sell or manual adjustment)
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

// Record a sale
export const addSale = async (itemId: number, quantity: number, price: number): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const date = new Date().toISOString();
  const total = quantity * price;
  await db.runAsync(
    'INSERT INTO sales (itemId, quantity, price, total, date) VALUES (?, ?, ?, ?, ?)',
    itemId, quantity, price, total, date
  );
};

// Get sales history for an item (optional usage)
export const getItemSales = async (itemId: number): Promise<SaleRecord[]> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const rows = await db.getAllAsync('SELECT * FROM sales WHERE itemId = ? ORDER BY date DESC', itemId);
  return rows as SaleRecord[];
};

// Delete item
export const deleteItem = async (id: number): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
};
