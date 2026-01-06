import * as FileSystem from 'expo-file-system/legacy';
import { cacheDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getAllItems } from '../src/database/db';
import { Platform, Alert } from 'react-native';

// Converts array of StockItem to CSV string
function convertToCsv(items: any[]): string {
  const header = 'Category,Subcategory,Color,Age Group,Price,Current Stock,Cost Price,Sold Quantity,Total Revenue,Estimated Profit,Last Updated';
  const rows = items.map(item => {
    const soldQty = item.soldQuantity || 0;
    const revenue = item.soldRevenue || 0;
    const costPrice = item.costPrice || 0;
    const profit = revenue - (soldQty * costPrice);

    return [
      item.category,
      item.subCategory || '',
      item.color,
      item.ageGroup,
      item.price || '',
      item.quantity, // Current stock
      costPrice,     // NEW: Cost Price
      soldQty,
      revenue,
      profit,        // NEW: Profit
      item.lastUpdated
    ]
      .map((field: string | number) => `"${String(field).replace(/"/g, '""')}"`).join(',')
  });
  return [header, ...rows].join('\n');
}

// Web download fallback
function webDownload(csv: string, filename = 'inventory.csv') {
  try {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Web download failed', e);
    Alert.alert('Export failed', 'Unable to download CSV on web');
  }
}

// Exports the CSV and opens the share dialog or downloads as fallback
export const exportInventoryToCSV = async () => {
  try {
    const items = await getAllItems();
    console.log('Exporting items:', items);

    if (!items || !items.length) {
      Alert.alert('No data', 'No inventory data to export');
      return;
    }

    const csv = convertToCsv(items);

    // Attempt to write file to cache
    const filename = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    const cacheDir = cacheDirectory || FileSystem.cacheDirectory || '';
    const fileUri = cacheDir + filename;
    try {
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });
    } catch (e) {
      console.warn('Failed to write file to cache:', e);
    }

    // Try native sharing
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Inventory CSV',
          UTI: 'public.comma-separated-values-text',
        });
        return;
      }
    } catch (e) {
      console.warn('Sharing failed', e);
    }

    // Web fallback
    if (Platform.OS === 'web') {
      webDownload(csv, filename);
      return;
    }

    // Native fallback: try copying to clipboard if available
    // try {
    //   const Clipboard = await import('expo-clipboard');
    //   if (Clipboard && Clipboard.setStringAsync) {
    //     await Clipboard.setStringAsync(csv);
    //     Alert.alert('Export', `CSV copied to clipboard. File saved at: ${fileUri}`);
    //     return;
    //   }
    // } catch (e) {
    //   console.warn('Clipboard copy failed or expo-clipboard not installed', e);
    // }

    // Final fallback: notify user where the file is
    if (fileUri) {
      Alert.alert('Export', `CSV saved to: ${fileUri}`);
    } else {
      Alert.alert('Export', 'Unable to save file. CSV printed to console.');
      console.log(csv);
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Export failed', String(error));
  }
};
