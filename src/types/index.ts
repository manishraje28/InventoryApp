export type Category = 'T-Shirt' | 'Shirt' | 'Pant' | 'Kurta' | 'Dress' | 'Other';
export type AgeGroup = '0-1' | '1-2' | '2-3' | '3-4' | '4-5';

export interface StockItem {
  id: number;
  category: Category;
  subCategory?: string;
  color: string;
  ageGroup: AgeGroup;
  price?: number;
  quantity: number;
  lastUpdated: string;
}

export interface SaleRecord {
  id: number;
  itemId: number;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

export type RootStackParamList = {
  Dashboard: undefined;
  AddItem: { item?: StockItem }; // Optional item for editing
  ItemDetail: { item: StockItem };
  SalesHistory: undefined;
  CsvPreview: undefined;

};
