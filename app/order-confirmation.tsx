import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function OrderConfirmationScreen() {
  const router = useRouter();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const orderNumber = '#3901-Z';
  const deliveryDate = '14 de Outubro';

  const handleBackToHome = () => {
    router.replace('/calendar');
  };

  const handleTrackOrder = () => {
    router.push('/track-order');
  };

  const handleViewGift = () => {
    router.push('/gift-display');
  };

  return (
    <View style={styles.container}>
      {/* Background Texture */}
      <View style={styles.textureOverlay} />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Glow Effect */}
          <View style={styles.glowEffect} />
          
          {/* Sparkle Particles */}
          <View style={[styles.particle, styles.particle1]}>
            <View style={styles.particleInner} />
          </View>
          <View style={[styles.particle, styles.particle2]}>
            <View style={styles.particleInner} />
          </View>
          <View style={[styles.particle, styles.particle3]}>
            <View style={styles.particleInner} />
          </View>
          <View style={[styles.particle, styles.particle4]}>
            <View style={styles.particleInner} />
          </View>

          {/* Gift Box Icon */}
          <Animated.View 
            style={[
              styles.giftIconContainer,
              {
                transform: [
                  { translateY: floatAnim },
                  { scale: scaleAnim },
                ],
              }
            ]}
          >
            <LinearGradient
              colors={['#F9D976', '#D4AF37', '#B5942D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.giftIconGradient}
            >
              <Ionicons name="gift" size={64} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Pedido Confirmado</Text>
          <Text style={styles.subtitle}>
            Sua escolha está a caminho de criar um momento inesquecível.
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardBorder} />
          <View style={styles.orderCardContent}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>PEDIDO</Text>
              <Text style={styles.orderValue}>{orderNumber}</Text>
            </View>
            <View style={styles.orderDivider} />
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>ENTREGA</Text>
              <Text style={styles.orderValue}>{deliveryDate}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewGift}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#EBC168', '#C89835']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="gift-outline" size={20} color="#4A3B10" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Ver Presente</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleTrackOrder}
          >
            <Ionicons name="location-outline" size={16} color="#C5908E" />
            <Text style={styles.secondaryButtonText}>Rastrear Entrega</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.tertiaryButtonText}>Voltar ao Inicio</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 40,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 80,
    opacity: 0.5,
  },
  particle: {
    position: 'absolute',
    borderRadius: 10,
  },
  particleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  particle1: {
    width: 6,
    height: 6,
    top: 0,
    right: 40,
    opacity: 0.6,
  },
  particle2: {
    width: 4,
    height: 4,
    bottom: 32,
    left: 24,
    opacity: 0.4,
  },
  particle3: {
    width: 8,
    height: 8,
    top: 32,
    left: -16,
    opacity: 0.3,
  },
  particle4: {
    width: 4,
    height: 4,
    top: -24,
    left: '50%',
    opacity: 0.5,
  },
  giftIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  textSection: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '400',
    color: '#3D3A33',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    fontStyle: 'italic',
    color: 'rgba(61, 58, 51, 0.7)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 260,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#FAF4F4',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#C5908E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(234, 218, 217, 0.6)',
  },
  orderCardBorder: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(234, 218, 217, 0.4)',
  },
  orderCardContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDivider: {
    height: 1,
    backgroundColor: 'rgba(197, 144, 142, 0.1)',
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#948C75',
    letterSpacing: 2,
  },
  orderValue: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#3D3A33',
  },
  actionsSection: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3B10',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#C5908E',
    letterSpacing: 0.5,
  },
  tertiaryButton: {
    paddingVertical: 8,
  },
  tertiaryButtonText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textDecorationLine: 'underline',
  },
});

