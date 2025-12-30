import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { StockItem } from '../types';
import * as DB from '../database/db';

interface InventoryContextType {
  items: StockItem[];
  isLoading: boolean;
  refreshItems: () => Promise<void>;
  addNewItem: (category: string, color: string, ageGroup: string, quantity: number) => Promise<void>;
  updateItemDetails: (id: number, category: string, color: string, ageGroup: string, quantity: number) => Promise<void>;
  quickSell: (id: number, currentQuantity: number) => Promise<void>;
  incrementStock: (id: number, currentQuantity: number) => Promise<void>;
  deleteStockItem: (id: number) => Promise<void>;
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

  const addNewItem = async (category: string, color: string, ageGroup: string, quantity: number) => {
    await DB.addItem(category, color, ageGroup, quantity);
    await refreshItems();
  };

  const updateItemDetails = async (id: number, category: string, color: string, ageGroup: string, quantity: number) => {
    await DB.updateItem(id, category, color, ageGroup, quantity);
    await refreshItems();
  };

  const quickSell = async (id: number, currentQuantity: number) => {
    if (currentQuantity > 0) {
      await DB.updateQuantity(id, currentQuantity - 1);
      await refreshItems();
    }
  };

  const incrementStock = async (id: number, currentQuantity: number) => {
    await DB.updateQuantity(id, currentQuantity + 1);
    await refreshItems();
  };

  const deleteStockItem = async (id: number) => {
    await DB.deleteItem(id);
    await refreshItems();
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
