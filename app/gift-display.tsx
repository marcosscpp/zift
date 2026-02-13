import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function GiftDisplayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Animations
  const boxScaleAnim = useRef(new Animated.Value(0.8)).current;
  const boxRotateAnim = useRef(new Animated.Value(0)).current;
  const lidOpenAnim = useRef(new Animated.Value(0)).current;
  const giftRevealAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;

  const [isOpened, setIsOpened] = useState(false);

  // Mock data - in production would come from params/API
  const gift = {
    id: '1',
    name: 'Kit Spa Premium',
    description: 'Um momento de relaxamento completo com produtos de alta qualidade para cuidados pessoais.',
    price: 289.90,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
    recipient: 'Maria Silva',
    recipientPhoto: 'https://i.pravatar.cc/150?img=5',
    occasion: 'Aniversario',
    matchScore: 94,
    orderNumber: '#ZFT-2024-1847',
    estimatedDelivery: '15 de Fevereiro',
  };

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.spring(boxScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(boxRotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleOpenGift = () => {
    if (isOpened) return;
    setIsOpened(true);

    Animated.sequence([
      // Shake the box
      Animated.sequence([
        Animated.timing(boxRotateAnim, { toValue: 1.05, duration: 50, useNativeDriver: true }),
        Animated.timing(boxRotateAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
        Animated.timing(boxRotateAnim, { toValue: 1.02, duration: 50, useNativeDriver: true }),
        Animated.timing(boxRotateAnim, { toValue: 0.98, duration: 50, useNativeDriver: true }),
        Animated.timing(boxRotateAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]),
      // Open the lid
      Animated.timing(lidOpenAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Reveal the gift
      Animated.parallel([
        Animated.spring(giftRevealAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const boxRotation = boxRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '0deg'],
  });

  const lidTranslateY = lidOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const lidRotate = lidOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });

  const giftScale = giftRevealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const giftTranslateY = giftRevealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.backgroundLight, theme.colors.primaryLight, theme.colors.backgroundLight]}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/calendar')}
        >
          <Ionicons name="close" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seu Presente</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gift Box Section */}
        <View style={styles.giftBoxSection}>
          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.sparkle,
                {
                  left: `${20 + (i * 10) % 60}%`,
                  top: `${15 + (i * 13) % 40}%`,
                  opacity: sparkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.8, 0.3],
                  }),
                  transform: [{
                    scale: sparkleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 0.8],
                    }),
                  }],
                },
              ]}
            >
              <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
            </Animated.View>
          ))}

          {/* Gift Box */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleOpenGift}
            disabled={isOpened}
          >
            <Animated.View
              style={[
                styles.giftBoxContainer,
                {
                  transform: [
                    { scale: boxScaleAnim },
                    { rotate: boxRotation },
                  ],
                },
              ]}
            >
              {/* Lid */}
              <Animated.View
                style={[
                  styles.giftLid,
                  {
                    transform: [
                      { translateY: lidTranslateY },
                      { rotateX: lidRotate },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.lidGradient}
                >
                  <View style={styles.bowContainer}>
                    <View style={styles.bowLoop1} />
                    <View style={styles.bowLoop2} />
                    <View style={styles.bowCenter} />
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Box Body */}
              <View style={styles.giftBody}>
                <LinearGradient
                  colors={[theme.colors.primaryLight, theme.colors.primary]}
                  style={styles.bodyGradient}
                >
                  <View style={styles.ribbonVertical} />
                  <View style={styles.ribbonHorizontal} />

                  {/* Gift inside */}
                  {isOpened && (
                    <Animated.View
                      style={[
                        styles.giftImageContainer,
                        {
                          opacity: giftRevealAnim,
                          transform: [
                            { scale: giftScale },
                            { translateY: giftTranslateY },
                          ],
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: gift.image }}
                        style={styles.giftImage}
                      />
                    </Animated.View>
                  )}
                </LinearGradient>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {!isOpened && (
            <Text style={styles.tapHint}>Toque para abrir</Text>
          )}
        </View>

        {/* Gift Details - shown after opening */}
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              opacity: contentFadeAnim,
              transform: [{
                translateY: contentFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              }],
            },
          ]}
        >
          {/* Gift Info Card */}
          <View style={styles.giftInfoCard}>
            <Text style={styles.giftName}>{gift.name}</Text>
            <Text style={styles.giftDescription}>{gift.description}</Text>

            <View style={styles.matchBadge}>
              <Ionicons name="heart" size={14} color={theme.colors.primary} />
              <Text style={styles.matchText}>{gift.matchScore}% de compatibilidade</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Valor</Text>
              <Text style={styles.priceValue}>R$ {gift.price.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>

          {/* Recipient Card */}
          <View style={styles.recipientCard}>
            <Text style={styles.cardTitle}>Destinatario</Text>
            <View style={styles.recipientRow}>
              <Image
                source={{ uri: gift.recipientPhoto }}
                style={styles.recipientPhoto}
              />
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{gift.recipient}</Text>
                <View style={styles.occasionBadge}>
                  <Ionicons name="gift-outline" size={12} color={theme.colors.primary} />
                  <Text style={styles.occasionText}>{gift.occasion}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <Ionicons name="cube-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Entrega</Text>
            </View>
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>Pedido</Text>
                <Text style={styles.deliveryValue}>{gift.orderNumber}</Text>
              </View>
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>Previsao</Text>
                <Text style={styles.deliveryValue}>{gift.estimatedDelivery}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => router.push('/track-order')}
            >
              <Ionicons name="location-outline" size={18} color="#FFFFFF" />
              <Text style={styles.trackButtonText}>Rastrear Entrega</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ordersButton}
              onPress={() => router.push('/orders')}
            >
              <Ionicons name="receipt-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.ordersButtonText}>Ver Pedidos</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  giftBoxSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    minHeight: 320,
  },
  sparkle: {
    position: 'absolute',
  },
  giftBoxContainer: {
    alignItems: 'center',
  },
  giftLid: {
    width: 160,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 10,
    marginBottom: -8,
  },
  lidGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bowContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
  },
  bowLoop1: {
    position: 'absolute',
    left: -18,
    top: 5,
    width: 24,
    height: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryDark,
    transform: [{ rotate: '-30deg' }],
  },
  bowLoop2: {
    position: 'absolute',
    right: -18,
    top: 5,
    width: 24,
    height: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryDark,
    transform: [{ rotate: '30deg' }],
  },
  bowCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryDark,
  },
  giftBody: {
    width: 150,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bodyGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonVertical: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: theme.colors.primaryDark,
    opacity: 0.3,
  },
  ribbonHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 20,
    backgroundColor: theme.colors.primaryDark,
    opacity: 0.3,
  },
  giftImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  giftImage: {
    width: '100%',
    height: '100%',
  },
  tapHint: {
    marginTop: 24,
    fontSize: 14,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  giftInfoCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  giftName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 8,
  },
  giftDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  matchText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.champagneBorder,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  recipientCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 12,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recipientPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundLight,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  occasionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  occasionText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  deliveryCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  deliveryInfo: {
    gap: 8,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  actionButtons: {
    gap: 12,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  ordersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
