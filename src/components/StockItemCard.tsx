import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { StockItem } from '../types';
import { colors } from '../theme/colors';

interface Props {
  item: StockItem;
  onPress: () => void;
}

export const StockItemCard: React.FC<Props> = ({ item, onPress }) => {
  const isLowStock = item.quantity > 0 && item.quantity <= 3;
  const isOutOfStock = item.quantity === 0;

  let statusColor = colors.secondary;
  let statusText = 'In Stock';

  if (isOutOfStock) {
    statusColor = colors.danger;
    statusText = 'Out of Stock';
  } else if (isLowStock) {
    statusColor = colors.warning;
    statusText = 'Low Stock';
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.category}>{item.category}</Text>
          {item.subCategory ? <Text style={styles.subCategory}>{item.subCategory}</Text> : null}
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{item.quantity}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>Color: <Text style={styles.bold}>{item.color}</Text></Text>
        <Text style={styles.detailText}>Age: <Text style={styles.bold}>{item.ageGroup}</Text></Text>
      </View>

      {item.price ? (
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>
      ) : null}

      {isOutOfStock && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>RESTOCK NEEDED</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  subCategory: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
  },
  priceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignSelf: 'flex-start',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bold: {
    color: colors.text,
    fontWeight: '600',
  },
  alert: {
    marginTop: 12,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertText: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 12,
  },
  thumbnail: {
    width: 110,
    height: 110,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: colors.background,
    resizeMode: 'cover',
  },
});
