import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CartItem {
  id: string;
  brand: string;
  name: string;
  price: number;
  image: string;
}

interface PaymentCard {
  id: string;
  lastDigits: string;
  holder: string;
  brand: 'visa' | 'mastercard';
  isSelected: boolean;
  isDark: boolean;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [giftWrap, setGiftWrap] = useState(true);
  const [selectedCard, setSelectedCard] = useState('1');

  const cartItems: CartItem[] = [
    {
      id: '1',
      brand: 'Rolex',
      name: 'Submariner Date',
      price: 85000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVrX5N2oAOVfnBFFU59oj94eHWq5-yVj-ZVsl5X9R0cne5eVCFDR0Jo3oSS1ghuswfvOzRB20EFBeJV0qbwSPbmFYc4I6H8CcCNRflt3fWTEhBr4TUzQ8JSi7A-dir6b2DxQro82iUcFVDki8lIsBbX_5b6CgxlyVuKo_DTPXB9MzRCddp6zNM5ry3CHnoeFVU2GOb5zzI0zQKxQm3HkwQ0paxPBKObhKXZ_8qq7G-Dr22pMAcsTFIyTSgYjETkowdMFPCNeB2sQ',
    },
    {
      id: '2',
      brand: 'Tom Ford',
      name: 'Oud Wood 100ml',
      price: 2400,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxgGDfCV6eUU9p1lhzsnIh7rU6dRslG41lyKIuziahe7BSF-5ydkTf6qebDhZEnr8E6Ekx6-ctn8n4koE9dQ4B4rLV-BWjP6hP_TIHJGMvz3_7e7dSeB6vRDlD-i0pPP_1XAp_iIgwLRkvWK3JIGI3Jd4CqDqAhk5suL54_oR2I-_3cXtaoL6utZ_BrsB5-xNAB8kW5Vom6HMSN9ANfHjUE4kePgrPlFhdaSCn-A-AjmqMN6yqVdNL7KH7868tsu6HkHsfbRYYdQ',
    },
  ];

  const cards: PaymentCard[] = [
    {
      id: '1',
      lastDigits: '4589',
      holder: 'ROBERTO A. FILHO',
      brand: 'visa',
      isSelected: true,
      isDark: true,
    },
    {
      id: '2',
      lastDigits: '9012',
      holder: 'ROBERTO A. FILHO',
      brand: 'mastercard',
      isSelected: false,
      isDark: false,
    },
  ];

  const address = {
    street: 'Av. Vieira Souto, 100 - Cob. 01',
    neighborhood: 'Ipanema, Rio de Janeiro - RJ',
    zipCode: 'CEP 22420-000',
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const total = subtotal;

  const formatPrice = (price: number) => {
    return `R$ ${price.toLocaleString('pt-BR')}`;
  };

  const handleFinishPurchase = () => {
    router.push('/order-confirmation');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/experimenta')}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product List */}
        <View style={styles.section}>
          {cartItems.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.cartItem,
                index < cartItems.length - 1 && styles.cartItemBorder
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Gift Option */}
        <View style={styles.giftSection}>
          <View style={styles.giftCard}>
            <View style={styles.giftContent}>
              <View style={styles.giftIcon}>
                <Ionicons name="gift" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.giftInfo}>
                <Text style={styles.giftTitle}>Presente ZIFT Signature</Text>
                <Text style={styles.giftDescription}>Embalagem de luxo com laço de cetim</Text>
              </View>
            </View>
            <Switch
              value={giftWrap}
              onValueChange={setGiftWrap}
              trackColor={{ 
                false: '#E5E7EB', 
                true: theme.colors.primary 
              }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ENDEREÇO DE ENTREGA</Text>
            <TouchableOpacity>
              <Text style={styles.changeLink}>ALTERAR</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressContent}>
            <Ionicons name="location" size={20} color="#8a8060" style={{ marginTop: 2 }} />
            <View style={styles.addressText}>
              <Text style={styles.addressStreet}>{address.street}</Text>
              <Text style={styles.addressDetails}>{address.neighborhood}</Text>
              <Text style={styles.addressDetails}>{address.zipCode}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PAGAMENTO</Text>
            <TouchableOpacity>
              <Text style={styles.changeLink}>ADICIONAR</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.paymentCard,
                  card.isDark ? styles.paymentCardDark : styles.paymentCardLight,
                  selectedCard === card.id && styles.paymentCardSelected,
                ]}
                onPress={() => setSelectedCard(card.id)}
                activeOpacity={0.8}
              >
                {selectedCard === card.id && (
                  <View style={styles.cardCheckmark}>
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                  </View>
                )}
                <View style={styles.cardChip} />
                <View style={styles.cardBottom}>
                  <Text style={[styles.cardNumber, card.isDark ? styles.textLight : styles.textDark]}>
                    **** **** **** {card.lastDigits}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={[styles.cardHolder, card.isDark ? styles.textLight : styles.textDark]}>
                      {card.holder}
                    </Text>
                    <Text style={[styles.cardBrand, card.isDark ? styles.textLight : styles.textDark]}>
                      {card.brand.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Order Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Entrega ZIFT Concierge</Text>
            <Text style={styles.totalValue}>Grátis</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Embalagem Signature</Text>
            <Text style={styles.totalValue}>Incluso</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <View style={styles.grandTotalContainer}>
              <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
              <Text style={styles.installments}>em até 10x sem juros</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <TouchableOpacity 
          style={styles.purchaseButton}
          onPress={handleFinishPurchase}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.purchaseGradient}
          >
            <Ionicons name="lock-closed" size={20} color="#181611" />
            <Text style={styles.purchaseButtonText}>FINALIZAR COMPRA SEGURA</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: `${theme.colors.backgroundLight}F2`,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 128, 96, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textMain,
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMain,
    letterSpacing: 1.5,
  },
  changeLink: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 20,
  },
  cartItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 128, 96, 0.1)',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  itemBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  giftSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  giftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  giftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftInfo: {
    gap: 4,
  },
  giftTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  giftDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  addressContent: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  addressText: {
    flex: 1,
  },
  addressStreet: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textMain,
    lineHeight: 22,
  },
  addressDetails: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(138, 128, 96, 0.2)',
    marginHorizontal: 24,
    marginVertical: 24,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  paymentCard: {
    width: 280,
    height: 170,
    borderRadius: 12,
    padding: 24,
    justifyContent: 'space-between',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
  },
  paymentCardDark: {
    backgroundColor: theme.colors.backgroundDark,
  },
  paymentCardLight: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentCardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cardCheckmark: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  cardChip: {
    width: 40,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(238, 205, 163, 0.8)',
  },
  cardBottom: {
    gap: 4,
  },
  cardNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolder: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  textLight: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  textDark: {
    color: '#6B7280',
  },
  totalsSection: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  totalDivider: {
    height: 1,
    backgroundColor: 'rgba(138, 128, 96, 0.1)',
    marginVertical: 4,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  grandTotalContainer: {
    alignItems: 'flex-end',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textMain,
    letterSpacing: -0.5,
  },
  installments: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: `${theme.colors.backgroundLight}CC`,
    borderTopWidth: 1,
    borderTopColor: 'rgba(138, 128, 96, 0.1)',
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});

