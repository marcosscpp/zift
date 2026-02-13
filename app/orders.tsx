import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../components/Header';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'delivered' | 'in_transit' | 'processing' | 'cancelled';
  recipient: string;
  items: {
    name: string;
    brand: string;
    price: number;
    image?: string;
  }[];
  total: number;
}

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ZFT-2024-001847',
      date: '15 Jan 2024',
      status: 'delivered',
      recipient: 'Ana Carolina',
      items: [
        { name: 'Cartier Tank Must', brand: 'Cartier', price: 28500 },
      ],
      total: 28500,
    },
    {
      id: '2',
      orderNumber: 'ZFT-2024-001823',
      date: '08 Jan 2024',
      status: 'in_transit',
      recipient: 'Roberto Filho',
      items: [
        { name: 'Submariner Date', brand: 'Rolex', price: 85000 },
        { name: 'Oud Wood 100ml', brand: 'Tom Ford', price: 2400 },
      ],
      total: 87400,
    },
    {
      id: '3',
      orderNumber: 'ZFT-2023-001756',
      date: '22 Dez 2023',
      status: 'delivered',
      recipient: 'Mariana Silva',
      items: [
        { name: 'Le Labo Santal 33', brand: 'Le Labo', price: 1890 },
      ],
      total: 1890,
    },
    {
      id: '4',
      orderNumber: 'ZFT-2023-001698',
      date: '10 Dez 2023',
      status: 'delivered',
      recipient: 'Isabella Vilanova',
      items: [
        { name: 'Bolsa Cassette', brand: 'Bottega Veneta', price: 18900 },
      ],
      total: 18900,
    },
  ];

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'delivered', label: 'Entregues' },
    { id: 'in_transit', label: 'Em trânsito' },
    { id: 'processing', label: 'Processando' },
  ];

  const filteredOrders = selectedFilter === 'all'
    ? orders
    : orders.filter(o => o.status === selectedFilter);

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return {
          label: 'Entregue',
          color: theme.colors.success,
          icon: 'checkmark-circle' as const,
          bgColor: `${theme.colors.success}15`,
        };
      case 'in_transit':
        return {
          label: 'Em trânsito',
          color: theme.colors.primary,
          icon: 'car' as const,
          bgColor: `${theme.colors.primary}15`,
        };
      case 'processing':
        return {
          label: 'Processando',
          color: theme.colors.warning,
          icon: 'time' as const,
          bgColor: `${theme.colors.warning}15`,
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: theme.colors.error,
          icon: 'close-circle' as const,
          bgColor: `${theme.colors.error}15`,
        };
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toLocaleString('pt-BR')}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Meus Pedidos"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/account')}
        showBack={true}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {orders.filter(o => o.status === 'delivered').length}
            </Text>
            <Text style={styles.statLabel}>Entregues</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {orders.filter(o => o.status === 'in_transit').length}
            </Text>
            <Text style={styles.statLabel}>Em trânsito</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={64} color={theme.colors.champagneBorder} />
              <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Seus pedidos com esse filtro aparecerão aqui
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    // Navegar para detalhes do pedido futuramente
                  }}
                >
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderDate}>{order.date}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                      <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  {/* Recipient */}
                  <View style={styles.recipientRow}>
                    <Ionicons name="gift-outline" size={16} color={theme.colors.roseGrey} />
                    <Text style={styles.recipientText}>
                      Presente para <Text style={styles.recipientName}>{order.recipient}</Text>
                    </Text>
                  </View>

                  {/* Items */}
                  <View style={styles.itemsContainer}>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <View style={styles.itemImagePlaceholder}>
                          <Ionicons name="gift" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemBrand}>{item.brand}</Text>
                          <Text style={styles.itemName}>{item.name}</Text>
                        </View>
                        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Order Footer */}
                  <View style={styles.orderFooter}>
                    <Text style={styles.totalLabel}>Total do pedido</Text>
                    <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
                  </View>

                  {/* Action Button */}
                  {order.status === 'in_transit' && (
                    <TouchableOpacity
                      style={styles.trackButton}
                      onPress={() => router.push(`/track-order?orderId=${order.id}&orderNumber=${order.orderNumber}`)}
                    >
                      <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.trackButtonText}>Rastrear entrega</Text>
                    </TouchableOpacity>
                  )}

                  {/* View Gift Button for delivered orders */}
                  {order.status === 'delivered' && (
                    <TouchableOpacity
                      style={styles.viewGiftButton}
                      onPress={() => router.push(`/gift-display?orderId=${order.id}`)}
                    >
                      <Ionicons name="gift-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.trackButtonText}>Ver Presente</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.champagneBorder,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.textMain,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  ordersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.roseGrey,
    marginTop: 8,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.champagneBorder,
    marginBottom: 16,
  },
  recipientText: {
    fontSize: 14,
    color: theme.colors.roseGrey,
  },
  recipientName: {
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  itemsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.champagneBorder,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.colors.roseGrey,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  viewGiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
});
