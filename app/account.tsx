import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomNav } from '../components/BottomNav';

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
}

interface GiftItem {
  id: string;
  name: string;
  status: 'sent' | 'received' | 'wishlist';
  image?: string;
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems: MenuItem[] = [
    { id: 'personal', icon: 'person-outline', label: 'Dados Pessoais', route: '/personal-data' },
    { id: 'orders', icon: 'bag-outline', label: 'Meus Pedidos', route: '/orders' },
    { id: 'people', icon: 'heart-outline', label: 'Pessoas Especiais', route: '/special-people' },
    { id: 'gift-history', icon: 'time-outline', label: 'Historico de Presentes', route: '/gift-history' },
    { id: 'gift-suggestion', icon: 'sparkles-outline', label: 'Sugestoes Zift Brain', route: '/gift-suggestion' },
    { id: 'shared-profile', icon: 'share-social-outline', label: 'Perfil Compartilhavel', route: '/shared-profile' },
    { id: 'notifications', icon: 'notifications-outline', label: 'Notificações', route: '/notifications' },
    { id: 'privacy', icon: 'shield-checkmark-outline', label: 'Privacidade (LGPD)', route: '/privacy' },
  ];

  const recentGifts: GiftItem[] = [
    { id: '1', name: 'Le Labo Santal 33', status: 'sent' },
    { id: '2', name: 'Cartier Tank', status: 'received' },
    { id: '3', name: 'Bottega Veneta', status: 'wishlist' },
    { id: '4', name: 'Diptyque Baies', status: 'sent' },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'received': return 'Recebido';
      case 'wishlist': return 'Wishlist';
      default: return status;
    }
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Minha Conta</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={theme.colors.primary} />
              </View>
            </View>
            <View style={styles.editAvatarButton}>
              <Ionicons name="pencil" size={12} color={theme.colors.backgroundDark} />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>Isabella Vilanova</Text>
          
          <TouchableOpacity 
            style={styles.memberBadge}
            onPress={() => router.push('/subscription')}
          >
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
            <Text style={styles.memberBadgeText}>MEMBRO PLATINUM</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={22} color={theme.colors.textMain} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.roseGrey} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Gifts Section */}
        <View style={styles.giftsSection}>
          <View style={styles.giftsSectionHeader}>
            <Text style={styles.giftsSectionTitle}>Últimos Presentes</Text>
            <TouchableOpacity onPress={() => router.push('/gift-history')}>
              <Text style={styles.viewHistoryButton}>VER HISTÓRICO</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.giftsScrollContent}
          >
            {recentGifts.map((gift) => (
              <TouchableOpacity key={gift.id} style={styles.giftCard}>
                <View style={styles.giftImageContainer}>
                  <Ionicons name="gift" size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.giftName} numberOfLines={1}>{gift.name}</Text>
                <Text style={styles.giftStatus}>{getStatusLabel(gift.status)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={() => router.push('/subscription')}
        >
          <LinearGradient
            colors={['#221e10', '#3a3525']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upgradeGradient}
          >
            <View style={styles.upgradeContent}>
              <Ionicons name="diamond" size={24} color={theme.colors.primary} />
              <Text style={styles.upgradeText}>Fazer Upgrade de Plano</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Z-Moedas Card */}
        <TouchableOpacity 
          style={styles.coinsCard}
          onPress={() => router.push('/achievements')}
        >
          <View style={styles.coinsContent}>
            <Ionicons name="wallet" size={24} color={theme.colors.primary} />
            <View style={styles.coinsInfo}>
              <Text style={styles.coinsLabel}>Z-Moedas Disponíveis</Text>
              <Text style={styles.coinsValue}>4.500</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.roseGrey} />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.logoutButton}>Sair da Conta</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>ZIFT Concierge Digital v2.5</Text>
        </View>
      </ScrollView>

      <BottomNav active="account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: theme.colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surfaceLight,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}33`,
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginTop: 16,
    marginBottom: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: `${theme.colors.primary}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
    letterSpacing: 1,
  },
  menuSection: {
    gap: 8,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconContainer: {
    opacity: 0.7,
  },
  menuItemLabel: {
    fontSize: 16,
    color: theme.colors.textMain,
  },
  giftsSection: {
    marginBottom: 24,
  },
  giftsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  giftsSectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'italic',
    color: theme.colors.textMain,
  },
  viewHistoryButton: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  giftsScrollContent: {
    gap: 16,
  },
  giftCard: {
    width: 130,
  },
  giftImageContainer: {
    aspectRatio: 3/4,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  giftName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginBottom: 2,
  },
  giftStatus: {
    fontSize: 10,
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upgradeButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  upgradeGradient: {
    padding: 1,
    borderRadius: 12,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#221e10',
    borderRadius: 11,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  coinsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
    marginBottom: 32,
  },
  coinsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinsInfo: {
    gap: 2,
  },
  coinsLabel: {
    fontSize: 12,
    color: theme.colors.roseGrey,
  },
  coinsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textMain,
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
  },
  logoutButton: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.roseGrey,
  },
  versionText: {
    fontSize: 10,
    color: theme.colors.champagneBorder,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
