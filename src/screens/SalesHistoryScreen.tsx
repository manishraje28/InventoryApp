import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as DB from '../database/db';
import { SaleRecord } from '../types';
import { colors } from '../theme/colors';

export const SalesHistoryScreen = () => {
    const navigation = useNavigation();
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        try {
            // We need a method to get ALL sales, or by item. For now, let's fetch all.
            const db = await DB.initDB();
            const results = await db.getAllAsync('SELECT sales.*, items.category, items.subCategory, items.color FROM sales JOIN items ON sales.itemId = items.id ORDER BY date DESC');
            setSales(results as any[]);
        } catch (error) {
            console.error('Failed to load sales', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View>
                    <Text style={styles.itemTitle}>{item.category} {item.subCategory ? `(${item.subCategory})` : ''}</Text>
                    <Text style={styles.itemSubtitle}>{item.color} • Qty: {item.quantity}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.price}>₹{item.total}</Text>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Recent Sales</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={sales}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No sales recorded yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        color: colors.primary,
        fontSize: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    itemSubtitle: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    date: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: colors.textLight,
        fontSize: 16,
    },
});
