// @ts-ignore
import * as SQLite from 'expo-sqlite';
import { StockItem, SaleRecord } from '../types';

const dbName = 'inventory.db';

// Initialize database with safe migrations
export const initDB = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);

  // Create tables if they don't exist
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
      costPrice REAL,
      imageUri TEXT,
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
    CREATE TABLE IF NOT EXISTS options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        parentId INTEGER
    );
  `);

  // Migration: Add new columns if they are missing
  try { await db.execAsync(`ALTER TABLE items ADD COLUMN subCategory TEXT;`); } catch (e) { }
  try { await db.execAsync(`ALTER TABLE items ADD COLUMN price REAL;`); } catch (e) { }
  // V2 Migrations
  try { await db.execAsync(`ALTER TABLE items ADD COLUMN costPrice REAL;`); } catch (e) { }
  try { await db.execAsync(`ALTER TABLE items ADD COLUMN imageUri TEXT;`); } catch (e) { }

  // Seed initial options if empty
  const result = await db.getAllAsync('SELECT count(*) as count FROM options');
  if (result.length > 0 && (result[0] as any).count === 0) {
    const initialCategories = ['T-Shirt', 'Shirt', 'Pant', 'Kurta', 'Dress'];
    const initialAges = ['0-1', '1-2', '2-3', '3-4', '4-5'];

    for (const cat of initialCategories) {
      await db.runAsync('INSERT INTO options (type, value) VALUES (?, ?)', 'CATEGORY', cat);
    }
    for (const age of initialAges) {
      await db.runAsync('INSERT INTO options (type, value) VALUES (?, ?)', 'AGE', age);
    }
  }

  return db;
};

// Get all items
export const getItems = async (): Promise<StockItem[]> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const allRows = await db.getAllAsync('SELECT * FROM items ORDER BY lastUpdated DESC');
  return allRows as StockItem[];
};

// Options Management
export const getOptions = (type: string, parentValue?: string): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabaseAsync(dbName);
      let query = 'SELECT value FROM options WHERE type = ?';
      let params = [type];

      if (parentValue) {
        const parentRes = await db.getFirstAsync('SELECT id FROM options WHERE value = ?', [parentValue]);
        if (parentRes) {
          query += ' AND parentId = ?';
          params.push((parentRes as any).id);
        } else {
          resolve([]);
          return;
        }
      }
      query += ' ORDER BY value ASC';

      const rows = await db.getAllAsync(query, params);
      resolve(rows.map((r: any) => r.value));
    } catch (error) {
      reject(error);
    }
  });
};

export const addOption = (type: string, value: string, parentValue?: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await SQLite.openDatabaseAsync(dbName);
      let parentId = null;
      if (parentValue) {
        const parentRes = await db.getFirstAsync('SELECT id FROM options WHERE value = ?', [parentValue]);
        if (parentRes) parentId = (parentRes as any).id;
      }

      await db.runAsync('INSERT INTO options (type, value, parentId) VALUES (?, ?, ?)', type, value, parentId);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
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
  quantity: number,
  costPrice?: number,
  imageUri?: string
): Promise<number> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const lastUpdated = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO items (category, subCategory, color, ageGroup, price, quantity, lastUpdated, costPrice, imageUri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    category,
    subCategory,
    color,
    ageGroup,
    price,
    quantity,
    lastUpdated,
    costPrice || 0,
    imageUri || null
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
  quantity: number,
  costPrice?: number,
  imageUri?: string
): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(dbName);
  const lastUpdated = new Date().toISOString();
  await db.runAsync(
    'UPDATE items SET category = ?, subCategory = ?, color = ?, ageGroup = ?, price = ?, quantity = ?, lastUpdated = ?, costPrice = ?, imageUri = ? WHERE id = ?',
    category,
    subCategory,
    color,
    ageGroup,
    price,
    quantity,
    lastUpdated,
    costPrice || 0,
    imageUri || null,
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
