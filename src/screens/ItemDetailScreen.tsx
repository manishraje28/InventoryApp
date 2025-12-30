import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useInventory } from '../context/InventoryContext';
import { colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ItemDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'ItemDetail'>;

export const ItemDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { items, quickSell, incrementStock, deleteStockItem } = useInventory();
  
  // Get latest item state from context
  const item = items.find(i => i.id === route.params.item.id);

  if (!item) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteStockItem(item.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddItem', { item })}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{item.category}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Color</Text>
            <Text style={styles.value}>{item.color}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Age Group</Text>
            <Text style={styles.value}>{item.ageGroup}</Text>
          </View>
        </View>

        <View style={styles.stockControl}>
          <Text style={styles.stockLabel}>Current Stock</Text>
          <Text style={[
            styles.stockCount,
            item.quantity === 0 && styles.outOfStock,
            item.quantity <= 3 && item.quantity > 0 && styles.lowStock
          ]}>
            {item.quantity}
          </Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.sellBtn]} 
              onPress={() => quickSell(item.id, item.quantity)}
              disabled={item.quantity === 0}
            >
              <Text style={styles.actionBtnText}>SELL (-1)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.addBtn]} 
              onPress={() => incrementStock(item.id, item.quantity)}
            >
              <Text style={[styles.actionBtnText, styles.addBtnText]}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Item</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    color: colors.primary,
  },
  editButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    fontSize: 16,
    color: colors.textLight,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  stockControl: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stockLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  stockCount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  outOfStock: {
    color: colors.danger,
  },
  lowStock: {
    color: colors.warning,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellBtn: {
    backgroundColor: colors.primary,
    flex: 2,
  },
  addBtn: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    flex: 1,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addBtnText: {
    color: colors.text,
  },
  deleteButton: {
    marginTop: 'auto',
    padding: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: colors.danger,
    fontSize: 16,
  },
});
