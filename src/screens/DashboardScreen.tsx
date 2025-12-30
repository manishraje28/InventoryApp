import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Category, AgeGroup } from '../types';
import { useInventory } from '../context/InventoryContext';
import { StockItemCard } from '../components/StockItemCard';
import { colors } from '../theme/colors';
import { Button } from 'react-native';
import { exportInventoryToCSV } from '../../utils/exportToCsv';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

const CATEGORIES: Category[] = ['T-Shirt', 'Shirt', 'Frock', 'Kurta', 'Dress'];
const AGE_GROUPS: AgeGroup[] = ['0-1', '1-2', '2-3', '3-4', '4-5'];

export const DashboardScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { items, isLoading } = useInventory();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedAge, setSelectedAge] = useState<string | null>(null);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.color.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
            const matchesAge = selectedAge ? item.ageGroup === selectedAge : true;

            return matchesSearch && matchesCategory && matchesAge;
        });
    }, [items, searchQuery, selectedCategory, selectedAge]);

    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);

    const renderFilterChip = (label: string, selected: boolean, onPress: () => void) => (
        <TouchableOpacity
            key={label}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mimi & Momo</Text>
                    <Text style={styles.subtitle}>{totalStock} items in stock</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddItem', {})}
                >
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>

                <Button 
                    title="Export"
                    onPress={exportInventoryToCSV}
                />
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search color or category..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                    {renderFilterChip('All', !selectedCategory, () => setSelectedCategory(null))}
                    {CATEGORIES.map(cat => (
                        renderFilterChip(cat, selectedCategory === cat, () => setSelectedCategory(cat === selectedCategory ? null : cat))
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                    {renderFilterChip('All Ages', !selectedAge, () => setSelectedAge(null))}
                    {AGE_GROUPS.map(age => (
                        renderFilterChip(age, selectedAge === age, () => setSelectedAge(age === selectedAge ? null : age))
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <StockItemCard
                        item={item}
                        onPress={() => navigation.navigate('ItemDetail', { item })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                }
            />
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textLight,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: colors.card,
    },
    searchInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filtersContainer: {
        backgroundColor: colors.card,
        paddingBottom: 8,
    },
    filtersScroll: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: colors.background,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipSelected: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    chipText: {
        color: colors.text,
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textLight,
        fontSize: 16,
    },
});
