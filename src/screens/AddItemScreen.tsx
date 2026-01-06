import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useInventory } from '../context/InventoryContext';
import { colors } from '../theme/colors';
import { Dropdown } from '../components/Dropdown';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export const AddItemScreen: React.FC<Props> = ({ navigation, route }) => {
  const { addNewItem, updateItemDetails, isLoading, fetchOptions, addNewOption } = useInventory();
  const editingItem = route.params?.item;

  // Form State
  const [category, setCategory] = useState(editingItem?.category || '');
  const [subCategory, setSubCategory] = useState(editingItem?.subCategory || '');
  const [color, setColor] = useState(editingItem?.color || '');
  const [ageGroup, setAgeGroup] = useState(editingItem?.ageGroup || '');

  // Pricing
  const [sellingPrice, setSellingPrice] = useState(editingItem?.price?.toString() || '');
  const [costPrice, setCostPrice] = useState(editingItem?.costPrice?.toString() || '');

  const [quantity, setQuantity] = useState(editingItem?.quantity?.toString() || '1');
  const [imageUri, setImageUri] = useState(editingItem?.imageUri || null);

  // Options State
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);

  // Initial Load
  useEffect(() => {
    loadOptions();
  }, []);

  // Load Subcategories when Category changes
  useEffect(() => {
    if (category) {
      loadSubCategories(category);
    } else {
      setSubCategories([]);
    }
  }, [category]);

  const loadOptions = async () => {
    try {
      const cats = await fetchOptions('CATEGORY');
      const ages = await fetchOptions('AGE');
      setCategories(cats);
      setAgeGroups(ages);
    } catch (e) {
      console.error("Failed to load options", e);
    }
  };

  const loadSubCategories = async (cat: string) => {
    const subs = await fetchOptions('SUBCATEGORY', cat);
    setSubCategories(subs);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!category || !color || !ageGroup || !quantity) {
      Alert.alert('Error', 'Please fill in Category, Color, Age Group, and Quantity.');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const priceVal = parseFloat(sellingPrice);
    if (sellingPrice && isNaN(priceVal)) {
      Alert.alert('Error', 'Invalid Selling Price');
      return;
    }

    const costVal = parseFloat(costPrice);
    if (costPrice && isNaN(costVal)) {
      Alert.alert('Error', 'Invalid Cost Price');
      return;
    }

    try {
      if (editingItem) {
        await updateItemDetails(
          editingItem.id,
          category,
          subCategory,
          color,
          ageGroup as any,
          priceVal || 0,
          qty,
          costVal || 0,
          imageUri || undefined
        );
      } else {
        await addNewItem(
          category,
          subCategory,
          color,
          ageGroup as any,
          priceVal || 0,
          qty,
          costVal || 0,
          imageUri || undefined
        );
      }
      navigation.goBack();
    } catch (error) {
      // Context handles error reporting
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{editingItem ? 'Edit Item' : 'Add New Item'}</Text>

          {/* Image Picker */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.imagePlaceholder}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <Text style={styles.imageText}>+ Add Photo</Text>
              )}
            </TouchableOpacity>
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.miniBtn} onPress={handlePickImage}>
                <Text style={styles.miniBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.miniBtn} onPress={handleTakePhoto}>
                <Text style={styles.miniBtnText}>Camera</Text>
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: colors.danger }]} onPress={() => setImageUri(null)}>
                  <Text style={styles.miniBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Dropdown */}
          <Dropdown
            label="Category"
            data={categories}
            selectedValue={category}
            onSelect={setCategory}
            onAddNew={async (val) => {
              await addNewOption('CATEGORY', val);
              loadOptions(); // Refresh list to include new option
            }}
            placeholder="Select or Add Category"
          />

          {/* Subcategory Dropdown */}
          <Dropdown
            label="Subcategory"
            data={subCategories}
            selectedValue={subCategory}
            onSelect={setSubCategory}
            disabled={!category}
            placeholder={!category ? "Select Category first" : "Select or Add Subcategory"}
            onAddNew={async (val) => {
              if (category) {
                await addNewOption('SUBCATEGORY', val, category);
                loadSubCategories(category);
              }
            }}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="e.g. Red, Blue, Pattern"
            />
          </View>

          {/* Age Group Dropdown */}
          <Dropdown
            label="Age Group"
            data={ageGroups}
            selectedValue={ageGroup}
            onSelect={setAgeGroup}
            onAddNew={async (val) => {
              await addNewOption('AGE', val);
              loadOptions();
            }}
            placeholder="Select or Add Age Group"
          />

          {/* Pricing Row */}
          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Cost Price (CP)</Text>
              <TextInput
                style={styles.input}
                value={costPrice}
                onChangeText={setCostPrice}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Selling Price (SP)</Text>
              <TextInput
                style={styles.input}
                value={sellingPrice}
                onChangeText={setSellingPrice}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.qtyContainer}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(0, (parseInt(quantity) || 0) - 1).toString())} style={styles.qtyBtn}><Text style={styles.qtyText}>-</Text></TouchableOpacity>
              <TextInput
                style={[styles.input, styles.qtyInput]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="numeric"
                textAlign="center"
              />
              <TouchableOpacity onPress={() => setQuantity(((parseInt(quantity) || 0) + 1).toString())} style={styles.qtyBtn}><Text style={styles.qtyText}>+</Text></TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledBtn]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Item</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 24 },

  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: colors.textLight, marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  flexHalf: { flex: 1 },

  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
  cancelButton: { alignItems: 'center', padding: 16 },
  cancelText: { color: colors.textLight, fontSize: 16 },

  // Image Styles
  imageSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imageText: { color: colors.textLight, fontSize: 12 },
  imageButtons: { marginLeft: 16, gap: 8 },
  miniBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  miniBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Qty
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  qtyText: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  qtyInput: { flex: 1 },
});

