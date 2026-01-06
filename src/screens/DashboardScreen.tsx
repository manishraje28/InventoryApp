import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Category, AgeGroup } from '../types';
import { useInventory } from '../context/InventoryContext';
import { StockItemCard } from '../components/StockItemCard';
import { Dropdown } from '../components/Dropdown';
import { colors } from '../theme/colors';
import { Button } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

const CATEGORIES: Category[] = ['T-Shirt', 'Shirt', 'Pant', 'Kurta', 'Dress'];
const AGE_GROUPS: AgeGroup[] = ['0-1', '1-2', '2-3', '3-4', '4-5'];
export const DashboardScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { items, isLoading, fetchOptions } = useInventory();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [selectedAge, setSelectedAge] = useState<string | null>(null);

    const [categories, setCategories] = useState<string[]>([]);
    const [ageGroups, setAgeGroups] = useState<string[]>([]);

    // Load options on mount
    React.useEffect(() => {
        const load = async () => {
            const cats = await fetchOptions('CATEGORY');
            const ages = await fetchOptions('AGE');
            setCategories(['All', ...cats]);
            setAgeGroups(['All', ...ages]);
        };
        load();
    }, []);



    const availableSubCategories = useMemo(() => {
        const relevantItems = selectedCategory && selectedCategory !== 'All'
            ? items.filter(i => i.category === selectedCategory)
            : items;
        const subs = new Set<string>();
        relevantItems.forEach(i => {
            if (i.subCategory && i.subCategory.trim()) {
                subs.add(i.subCategory.trim());
            }
        });
        return Array.from(subs).sort();
    }, [items, selectedCategory]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.subCategory && item.subCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.color.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory && selectedCategory !== 'All' ? item.category === selectedCategory : true;
            const matchesSubCategory = selectedSubCategory && selectedSubCategory !== 'All' ? item.subCategory === selectedSubCategory : true;
            const matchesAge = selectedAge && selectedAge !== 'All' ? item.ageGroup === selectedAge : true;

            return matchesSearch && matchesCategory && matchesSubCategory && matchesAge;
        });
    }, [items, searchQuery, selectedCategory, selectedSubCategory, selectedAge]);

    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mimi & Momo</Text>
                    <Text style={styles.subtitle}>{totalStock} items in stock</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddItem', {})}
                    >
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.secondary, marginLeft: 8 }]}
                        onPress={() => (navigation as any).navigate('CsvPreview')}
                    >
                        <Text style={styles.addButtonText}>Export</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search category, subcategory, color..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filtersContainer}>
                <View style={styles.filterRow}>
                    <View style={styles.filterFlex}>
                        <Dropdown
                            label="Category"
                            data={categories}
                            selectedValue={selectedCategory || 'All'}
                            onSelect={(val) => {
                                setSelectedCategory(val === 'All' ? null : val);
                                setSelectedSubCategory(null);
                            }}
                        />
                    </View>
                    <View style={styles.filterFlex}>
                        <Dropdown
                            label="Age"
                            data={ageGroups}
                            selectedValue={selectedAge || 'All'}
                            onSelect={(val) => setSelectedAge(val === 'All' ? null : val)}
                        />
                    </View>
                </View>

                {availableSubCategories.length > 0 && (
                    <View style={{ paddingHorizontal: 16 }}>
                        <Dropdown
                            label="Subcategory"
                            data={['All', ...availableSubCategories]}
                            selectedValue={selectedSubCategory || 'All'}
                            onSelect={(val) => setSelectedSubCategory(val === 'All' ? null : val)}
                        />
                    </View>
                )}
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
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
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
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    filterFlex: {
        flex: 1,
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
