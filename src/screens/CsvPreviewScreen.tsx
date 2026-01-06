import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getAllItems } from '../database/db';
import { exportInventoryToCSV } from '../../utils/exportToCsv';

export const CsvPreviewScreen: React.FC = () => {
    const [csv, setCsv] = useState<string>('');
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const items = await getAllItems();
                // CSV without timestamp
                const header = 'Category,Color,Age Group,Quantity';
                const rows = items.map((item: any) =>
                    [item.category, item.color, item.ageGroup, item.quantity]
                        .map((f: any) => `"${String(f).replace(/"/g, '""')}"`).join(',')
                );
                setCsv([header, ...rows].join('\n'));
                setItems(items);
            } catch (e) {
                console.error(e);
                Alert.alert('Error', 'Failed to prepare CSV');
            }
        };
        load();
    }, []);

    //   const handleCopy = async () => {
    //     try {
    //       const Clipboard = await import('expo-clipboard');
    //       if (Clipboard && Clipboard.setStringAsync) {
    //         await Clipboard.setStringAsync(csv);
    //         Alert.alert('Copied', 'CSV copied to clipboard');
    //         return;
    //       }
    //     } catch (e) {
    //       console.warn('Clipboard not available', e);
    //     }
    //     Alert.alert('Copy', 'Clipboard not available. Please select and copy the text manually.');
    //   };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Inventory Preview</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {/* <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity> */}
                    <TouchableOpacity style={[styles.copyBtn, { backgroundColor: '#059669' }]} onPress={() => exportInventoryToCSV()}>
                        <Text style={styles.copyText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ padding: 8 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>Category</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>Subcategory</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 80 }]}>Color</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 80 }]}>Age</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 80 }]}>Price</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 60 }]}>Stock</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 80 }]}>Cost</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 60 }]}>Sold</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>Revenue</Text>
                            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>Profit</Text>
                        </View>
                        {items.length === 0 && (
                            <View style={{ padding: 16 }}>
                                <Text style={{ color: colors.textLight }}>No items to preview</Text>
                            </View>
                        )}
                        {items.map((it, idx) => {
                            const soldQty = it.soldQuantity || 0;
                            const revenue = it.soldRevenue || 0;
                            const costPrice = it.costPrice || 0;
                            const profit = revenue - (soldQty * costPrice);

                            return (
                                <View key={it.id ?? idx} style={styles.tableRow}>
                                    <Text style={[styles.cell, { width: 100 }]}>{it.category}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{it.subCategory || '-'}</Text>
                                    <Text style={[styles.cell, { width: 80 }]}>{it.color}</Text>
                                    <Text style={[styles.cell, { width: 80 }]}>{it.ageGroup}</Text>
                                    <Text style={[styles.cell, { width: 80 }]}>{it.price ? `₹${it.price}` : '-'}</Text>
                                    <Text style={[styles.cell, { width: 60 }]}>{it.quantity}</Text>
                                    <Text style={[styles.cell, { width: 80 }]}>{costPrice ? `₹${costPrice}` : '-'}</Text>
                                    <Text style={[styles.cell, { width: 60 }]}>{soldQty}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>₹{revenue}</Text>
                                    <Text style={[styles.cell, { width: 100, fontWeight: 'bold', color: profit >= 0 ? colors.primary : colors.danger }]}>₹{profit}</Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    title: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    copyBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    copyText: { color: '#fff', fontWeight: 'bold' },
    content: { flex: 1 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.background },
    cell: { paddingHorizontal: 8, color: colors.text },
    headerCell: { fontWeight: '700', color: colors.textLight },
});
