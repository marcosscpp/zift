import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  completed: boolean;
  current: boolean;
}

export default function TrackOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const carAnim = useRef(new Animated.Value(0)).current;

  // Mock data do pedido
  const order = {
    id: orderId || 'ZFT-2024-001823',
    recipient: 'Roberto Filho',
    product: 'Rolex Submariner Date',
    estimatedDelivery: '10 de Fevereiro, 2024',
    address: 'Av. Vieira Souto, 100 - Cob. 01, Ipanema',
    currentStatus: 'in_transit',
    progress: 65, // porcentagem do progresso
  };

  const trackingSteps: TrackingStep[] = [
    {
      id: '1',
      title: 'Pedido Confirmado',
      description: 'Pagamento aprovado e pedido processado',
      time: '14:32',
      date: '08 Fev',
      completed: true,
      current: false,
    },
    {
      id: '2',
      title: 'Em Preparação',
      description: 'Presente sendo embalado com cuidado ZIFT',
      time: '09:15',
      date: '09 Fev',
      completed: true,
      current: false,
    },
    {
      id: '3',
      title: 'Saiu para Entrega',
      description: 'Concierge ZIFT a caminho do destino',
      time: '08:45',
      date: '10 Fev',
      completed: true,
      current: true,
    },
    {
      id: '4',
      title: 'Entregue',
      description: 'Presente entregue com sucesso',
      time: '--:--',
      date: '10 Fev',
      completed: false,
      current: false,
    },
  ];

  useEffect(() => {
    // Animação de pulso para o status atual
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animação do carro no mapa
    Animated.loop(
      Animated.sequence([
        Animated.timing(carAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(carAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/orders')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rastrear Entrega</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mini Mapa Demonstrativo */}
        <View style={styles.mapContainer}>
          <LinearGradient
            colors={[theme.colors.backgroundDark, '#2A2620']}
            style={styles.mapGradient}
          >
            {/* Grid do mapa */}
            <View style={styles.mapGrid}>
              {[...Array(6)].map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLineH, { top: `${i * 20}%` }]} />
              ))}
              {[...Array(8)].map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLineV, { left: `${i * 14.28}%` }]} />
              ))}
            </View>

            {/* Rota tracejada */}
            <View style={styles.routePath}>
              <View style={styles.routeDot} />
              <View style={styles.routeLine} />
              <View style={styles.routeLine} />
              <View style={styles.routeLine} />
            </View>

            {/* Ponto de origem */}
            <View style={styles.originPoint}>
              <View style={styles.originDot} />
              <Text style={styles.originLabel}>ZIFT HQ</Text>
            </View>

            {/* Veículo animado */}
            <Animated.View
              style={[
                styles.vehicleContainer,
                {
                  transform: [
                    {
                      translateX: carAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, width - 120],
                      }),
                    },
                    {
                      translateY: carAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 30, 60],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.vehiclePulse,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.vehicleIcon}>
                <Ionicons name="car" size={20} color={theme.colors.backgroundDark} />
              </View>
            </Animated.View>

            {/* Ponto de destino */}
            <View style={styles.destinationPoint}>
              <View style={styles.destinationDot}>
                <Ionicons name="location" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.destinationLabel}>Destino</Text>
            </View>

            {/* Legenda do mapa */}
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={styles.legendText}>Em trânsito</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                <Text style={styles.legendText}>Destino</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusBadge}>
              <Animated.View
                style={[
                  styles.statusPulse,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <Ionicons name="car" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Em Trânsito</Text>
              <Text style={styles.statusSubtitle}>
                Previsão: {order.estimatedDelivery}
              </Text>
            </View>
          </View>

          {/* Barra de progresso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${order.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{order.progress}%</Text>
          </View>
        </View>

        {/* Informações do Pedido */}
        <View style={styles.orderInfo}>
          <Text style={styles.sectionTitle}>Detalhes do Pedido</Text>

          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={18} color={theme.colors.roseGrey} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Número do pedido</Text>
              <Text style={styles.infoValue}>{order.id}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="gift-outline" size={18} color={theme.colors.roseGrey} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Presente</Text>
              <Text style={styles.infoValue}>{order.product}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={theme.colors.roseGrey} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Destinatário</Text>
              <Text style={styles.infoValue}>{order.recipient}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={theme.colors.roseGrey} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Endereço de entrega</Text>
              <Text style={styles.infoValue}>{order.address}</Text>
            </View>
          </View>
        </View>

        {/* Timeline de Rastreamento */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Histórico</Text>

          {trackingSteps.map((step, index) => (
            <View key={step.id} style={styles.timelineItem}>
              {/* Linha conectora */}
              {index < trackingSteps.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    step.completed && styles.timelineLineCompleted,
                  ]}
                />
              )}

              {/* Indicador */}
              <View
                style={[
                  styles.timelineIndicator,
                  step.completed && styles.timelineIndicatorCompleted,
                  step.current && styles.timelineIndicatorCurrent,
                ]}
              >
                {step.current ? (
                  <Animated.View
                    style={[
                      styles.currentPulse,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                ) : null}
                {step.completed ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <View style={styles.timelineDot} />
                )}
              </View>

              {/* Conteúdo */}
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      step.current && styles.timelineTitleCurrent,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.timelineTime}>
                    {step.date} • {step.time}
                  </Text>
                </View>
                <Text style={styles.timelineDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ação */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => router.push('/account')}
        >
          <Ionicons name="headset-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.contactButtonText}>Falar com Concierge ZIFT</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: theme.colors.backgroundLight,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  mapContainer: {
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    height: 200,
  },
  mapGradient: {
    flex: 1,
    position: 'relative',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  routePath: {
    position: 'absolute',
    top: '40%',
    left: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 8,
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${theme.colors.primary}40`,
    marginRight: 8,
    borderRadius: 1,
  },
  originPoint: {
    position: 'absolute',
    top: '30%',
    left: 20,
    alignItems: 'center',
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.roseGrey,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  originLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontWeight: '600',
  },
  vehicleContainer: {
    position: 'absolute',
    top: '35%',
    alignItems: 'center',
  },
  vehiclePulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}30`,
  },
  vehicleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationPoint: {
    position: 'absolute',
    bottom: '20%',
    right: 20,
    alignItems: 'center',
  },
  destinationDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontWeight: '600',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  statusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  statusSubtitle: {
    fontSize: 13,
    color: theme.colors.roseGrey,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.champagneBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  orderInfo: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textMain,
    fontWeight: '500',
  },
  timelineSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 28,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.champagneBorder,
  },
  timelineLineCompleted: {
    backgroundColor: theme.colors.primary,
  },
  timelineIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.champagneBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  timelineIndicatorCompleted: {
    backgroundColor: theme.colors.primary,
  },
  timelineIndicatorCurrent: {
    backgroundColor: theme.colors.primary,
  },
  currentPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}30`,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.roseGrey,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  timelineTitleCurrent: {
    color: theme.colors.primary,
  },
  timelineTime: {
    fontSize: 11,
    color: theme.colors.roseGrey,
  },
  timelineDescription: {
    fontSize: 13,
    color: theme.colors.roseGrey,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
