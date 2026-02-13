import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ProductSpec {
  label: string;
  value: string;
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name, price, category } = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
    category?: string;
  }>();

  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock product data - in production, fetch based on id
  const product = {
    id: id || '1',
    name: name || 'Cartier Tank Must',
    brand: 'Cartier',
    category: category || 'Relojoaria de Luxo',
    price: price ? parseInt(price) : 28500,
    zMoedas: 2850,
    description: 'O Cartier Tank Must é um ícone atemporal da relojoaria francesa. Com seu design retangular elegante e acabamento impecável, este relógio representa a perfeita fusão entre tradição e modernidade.',
    specs: [
      { label: 'Material', value: 'Aço inoxidável' },
      { label: 'Movimento', value: 'Quartzo' },
      { label: 'Resistência', value: '30m' },
      { label: 'Pulseira', value: 'Couro genuíno' },
    ] as ProductSpec[],
    matchScore: 98,
    aiInsight: 'Baseado no estilo clássico e preferências de acessórios de luxo.',
  };

  const recipients = [
    { id: '1', name: 'Ana Carolina', relation: 'Esposa', matchScore: 98 },
    { id: '2', name: 'Roberto Filho', relation: 'Filho', matchScore: 72 },
    { id: '3', name: 'Mariana Silva', relation: 'Amiga', matchScore: 85 },
  ];

  const formatPrice = (price: number) => {
    return `R$ ${price.toLocaleString('pt-BR')}`;
  };

  const handleAddToCart = () => {
    router.push({
      pathname: '/checkout',
      params: { productId: product.id }
    });
  };

  const handleGiftSuggestion = () => {
    router.push({
      pathname: '/gift-suggestion',
      params: { person: selectedRecipient || 'Ana Carolina' }
    });
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/experimenta')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? theme.colors.error : theme.colors.textMain}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="gift" size={80} color={theme.colors.primary} />
          </View>
          {/* Match Badge */}
          <View style={styles.matchBadge}>
            <Ionicons name="sparkles" size={14} color={theme.colors.primaryDark} />
            <Text style={styles.matchText}>{product.matchScore}% Match</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            <View style={styles.zMoedasBadge}>
              <Ionicons name="wallet-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.zMoedasText}>+{product.zMoedas} Z-Moedas</Text>
            </View>
          </View>

          {/* Installments */}
          <Text style={styles.installments}>
            ou em até 10x de {formatPrice(Math.ceil(product.price / 10))} sem juros
          </Text>
        </View>

        {/* AI Insight Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            <Text style={styles.aiCardTitle}>ZIFT BRAIN</Text>
          </View>
          <Text style={styles.aiCardText}>{product.aiInsight}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especificações</Text>
          <View style={styles.specsGrid}>
            {product.specs.map((spec, index) => (
              <View key={index} style={styles.specItem}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Select Recipient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presentear quem?</Text>
          <Text style={styles.sectionSubtitle}>Selecione um destinatário para ver a compatibilidade</Text>

          <View style={styles.recipientsContainer}>
            {recipients.map((recipient) => (
              <TouchableOpacity
                key={recipient.id}
                style={[
                  styles.recipientCard,
                  selectedRecipient === recipient.id && styles.recipientCardSelected,
                ]}
                onPress={() => setSelectedRecipient(recipient.id)}
                activeOpacity={0.7}
              >
                <View style={styles.recipientAvatar}>
                  <Ionicons
                    name="person"
                    size={20}
                    color={selectedRecipient === recipient.id ? theme.colors.primary : theme.colors.roseGrey}
                  />
                </View>
                <View style={styles.recipientInfo}>
                  <Text style={[
                    styles.recipientName,
                    selectedRecipient === recipient.id && styles.recipientNameSelected,
                  ]}>
                    {recipient.name}
                  </Text>
                  <Text style={styles.recipientRelation}>{recipient.relation}</Text>
                </View>
                <View style={styles.recipientMatch}>
                  <Text style={[
                    styles.recipientMatchText,
                    recipient.matchScore >= 90 && styles.highMatch,
                  ]}>
                    {recipient.matchScore}%
                  </Text>
                </View>
                {selectedRecipient === recipient.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <TouchableOpacity
          style={styles.experimentaButton}
          onPress={handleGiftSuggestion}
        >
          <Ionicons name="eye-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.experimentaButtonText}>Experimentar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleAddToCart}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyButtonGradient}
          >
            <Ionicons name="bag-add" size={20} color="#FFFFFF" />
            <Text style={styles.buyButtonText}>Comprar</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: theme.colors.backgroundLight,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceLight,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 24,
    backgroundColor: theme.colors.surfaceLight,
  },
  productCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.roseGrey,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  productName: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  zMoedasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}15`,
  },
  zMoedasText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  installments: {
    fontSize: 13,
    color: theme.colors.roseGrey,
  },
  aiCard: {
    margin: 16,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundDark,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 1.5,
  },
  aiCardText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.roseGrey,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specItem: {
    width: (width - 48 - 12) / 2,
    padding: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  recipientsContainer: {
    gap: 12,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  recipientCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  recipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  recipientNameSelected: {
    color: theme.colors.primary,
  },
  recipientRelation: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    marginTop: 2,
  },
  recipientMatch: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundLight,
  },
  recipientMatchText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  highMatch: {
    color: theme.colors.success,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: theme.colors.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.champagneBorder,
  },
  experimentaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  experimentaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  buyButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
