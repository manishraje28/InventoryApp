import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Category, AgeGroup, StockItem } from '../types';
import { useInventory } from '../context/InventoryContext';
import { colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddItem'>;
type RouteProps = RouteProp<RootStackParamList, 'AddItem'>;

// Extended categories to include common ones, but user can always use 'Other'
const CATEGORIES: Category[] = ['T-Shirt', 'Shirt', 'Pant', 'Kurta', 'Other'];
const AGE_GROUPS: (AgeGroup | 'Other')[] = ['0-1', '1-2', '2-3', '3-4', '4-5', 'Other'];

export const AddItemScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { addNewItem, updateItemDetails, isLoading } = useInventory();
  const editingItem = route.params?.item;

  const [category, setCategory] = useState<string>(editingItem?.category || CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState<string>('');

  const [subCategory, setSubCategory] = useState<string>(editingItem?.subCategory || '');

  const [color, setColor] = useState(editingItem?.color || '');

  const [ageGroup, setAgeGroup] = useState<string>(editingItem?.ageGroup || AGE_GROUPS[0]);
  const [customAgeGroup, setCustomAgeGroup] = useState<string>('');

  const [price, setPrice] = useState(editingItem?.price?.toString() || '');
  const [quantity, setQuantity] = useState(editingItem?.quantity.toString() || '1');

  useEffect(() => {
    if (editingItem) {
      // Check if category is standard or custom
      if (!CATEGORIES.includes(editingItem.category as any)) {
        setCategory('Other');
        setCustomCategory(editingItem.category);
      }

      // Check if age group is standard or custom
      if (!AGE_GROUPS.includes(editingItem.ageGroup as any)) {
        setAgeGroup('Other');
        setCustomAgeGroup(editingItem.ageGroup);
      }
    }
  }, [editingItem]);

  const handleSave = async () => {
    if (!color.trim()) {
      Alert.alert('Error', 'Please enter a color');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const priceVal = parseFloat(price);
    if (price.trim() !== '' && (isNaN(priceVal) || priceVal < 0)) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    if (!finalCategory) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const finalAgeGroup = ageGroup === 'Other' ? customAgeGroup.trim() : ageGroup;
    if (!finalAgeGroup) {
      Alert.alert('Error', 'Please enter an age group');
      return;
    }

    try {
      if (editingItem) {
        await updateItemDetails(
          editingItem.id,
          finalCategory,
          subCategory.trim(),
          color,
          finalAgeGroup as AgeGroup,
          priceVal || 0,
          qty
        );
      } else {
        await addNewItem(
          finalCategory,
          subCategory.trim(),
          color,
          finalAgeGroup as AgeGroup,
          priceVal || 0,
          qty
        );
      }
      navigation.goBack();
    } catch (error) {
      // Error handled in context
    }
  };

  const renderOption = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={styles.backButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{editingItem ? 'Edit Item' : 'Add New Item'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButton, isLoading && { opacity: 0.5 }]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map(cat => renderOption(cat, category === cat, () => setCategory(cat)))}
            </View>
            {category === 'Other' && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.subLabel}>Custom Category Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Jackets"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Subcategory (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Graphic Print, V-Neck"
              value={subCategory}
              onChangeText={setSubCategory}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Age Group</Text>
            <View style={styles.optionsGrid}>
              {AGE_GROUPS.map(age => renderOption(age, ageGroup === age, () => setAgeGroup(age)))}
            </View>
            {ageGroup === 'Other' && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.subLabel}>Custom Age Group</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 6-12 m, 10-12 y"
                  value={customAgeGroup}
                  onChangeText={setCustomAgeGroup}
                />
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Red"
                value={color}
                onChangeText={setColor}
              />
            </View>
            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(0, (parseInt(quantity) || 0) - 1).toString())}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(((parseInt(quantity) || 0) + 1).toString())}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  backButton: {
    fontSize: 16,
    color: colors.textLight,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtnText: {
    fontSize: 24,
    color: colors.text,
  },
  qtyInput: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    fontWeight: 'bold',
  },
});
