export type Category = 'T-Shirt' | 'Shirt' | 'Frock' | 'Kurta' | 'Dress' | 'Other';
export type AgeGroup = '0-1' | '1-2' | '2-3' | '3-4' | '4-5';

export interface StockItem {
  id: number;
  category: Category;
  color: string;
  ageGroup: AgeGroup;
  quantity: number;
  lastUpdated: string;
}

export type RootStackParamList = {
  Dashboard: undefined;
  AddItem: { item?: StockItem }; // Optional item for editing
  ItemDetail: { item: StockItem };
};
