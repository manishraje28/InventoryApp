import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { StockItem } from '../types';
import * as DB from '../database/db';

interface InventoryContextType {
  items: StockItem[];
  isLoading: boolean;
  refreshItems: () => Promise<void>;
  addNewItem: (category: string, subCategory: string, color: string, ageGroup: string, price: number, quantity: number, costPrice?: number, imageUri?: string) => Promise<void>;
  updateItemDetails: (id: number, category: string, subCategory: string, color: string, ageGroup: string, price: number, quantity: number, costPrice?: number, imageUri?: string) => Promise<void>;
  quickSell: (id: number, currentQuantity: number, currentPrice?: number) => Promise<void>;
  incrementStock: (id: number, currentQuantity: number) => Promise<void>;
  deleteStockItem: (id: number) => Promise<void>;
  // Options
  fetchOptions: (type: string, parentValue?: string) => Promise<string[]>;
  addNewOption: (type: string, value: string, parentValue?: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshItems = useCallback(async () => {
    try {
      const data = await DB.getItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await DB.initDB();
      await refreshItems();
    };
    init();
  }, [refreshItems]);

  const addNewItem = async (category: string, subCategory: string, color: string, ageGroup: string, price: number, quantity: number, costPrice?: number, imageUri?: string) => {
    try {
      setIsLoading(true);
      await DB.addItem(category, subCategory, color, ageGroup, price, quantity, costPrice, imageUri);
      await refreshItems();
    } catch (error) {
      console.error("Failed to add item", error);
      alert("Failed to save item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemDetails = async (id: number, category: string, subCategory: string, color: string, ageGroup: string, price: number, quantity: number, costPrice?: number, imageUri?: string) => {
    try {
      setIsLoading(true);
      await DB.updateItem(id, category, subCategory, color, ageGroup, price, quantity, costPrice, imageUri);
      await refreshItems();
    } catch (error) {
      console.error("Failed to update item", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickSell = async (id: number, currentQuantity: number, currentPrice?: number) => {
    if (currentQuantity > 0) {
      try {
        await DB.updateQuantity(id, currentQuantity - 1);
        if (currentPrice !== undefined) {
          await DB.addSale(id, 1, currentPrice);
        }
        await refreshItems();
      } catch (error) {
        console.error("Failed to quick sell", error);
        alert("Failed to record sale.");
      }
    }
  };

  const incrementStock = async (id: number, currentQuantity: number) => {
    try {
      await DB.updateQuantity(id, currentQuantity + 1);
      await refreshItems();
    } catch (error) {
      console.error("Failed to increment stock", error);
    }
  };

  const deleteStockItem = async (id: number) => {
    try {
      await DB.deleteItem(id);
      await refreshItems();
    } catch (error) {
      console.error("Failed to delete item", error);
      alert("Failed to delete item.");
    }
  };

  const fetchOptions = async (type: string, parentValue?: string) => {
    return await DB.getOptions(type, parentValue);
  };

  const addNewOption = async (type: string, value: string, parentValue?: string) => {
    await DB.addOption(type, value, parentValue);
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        isLoading,
        refreshItems,
        addNewItem,
        updateItemDetails,
        quickSell,
        incrementStock,
        deleteStockItem,
        fetchOptions,
        addNewOption
      }}
    >
      {children}
    </InventoryContext.Provider>
  );

};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
