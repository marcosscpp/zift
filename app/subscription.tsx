import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  tier: 'bronze' | 'prata' | 'ouro' | 'platinum';
  highlight?: boolean;
  exclusive?: boolean;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: 49.90,
      yearlyPrice: 42.42,
      features: ['Acesso ao catálogo básico', 'Envio padrão'],
      tier: 'bronze',
    },
    {
      id: 'prata',
      name: 'Prata',
      price: 99.90,
      yearlyPrice: 84.92,
      features: ['Curadoria assistida por IA', 'Envio expresso', 'Embalagem premium ZIFT'],
      tier: 'prata',
    },
    {
      id: 'ouro',
      name: 'Ouro',
      price: 199.90,
      yearlyPrice: 169.92,
      features: ['Personal shopper dedicado', 'Envio prioritário', 'Embalagem luxo com carta'],
      tier: 'ouro',
      highlight: true,
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 299.90,
      yearlyPrice: 254.92,
      features: [
        'Interceptação de Agenda',
        'Concierge Pessoal 24h',
        'Acesso a eventos privados',
        'Frete blindado & seguro total',
      ],
      tier: 'platinum',
      exclusive: true,
    },
  ];

  const handleSubscribe = (plan: Plan) => {
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    Alert.alert(
      'Confirmar Assinatura',
      `Deseja assinar o plano ${plan.name} por R$ ${price?.toFixed(2).replace('.', ',')}/mês?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Assinar', 
          onPress: () => {
            Alert.alert('Sucesso!', `Você agora é assinante ${plan.name}!`);
            router.canGoBack() ? router.back() : router.replace('/account');
          }
        },
      ]
    );
  };

  const getPrice = (plan: Plan) => {
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    return price?.toFixed(2).replace('.', ',');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}
        >
          <Ionicons name="close" size={24} color={theme.colors.roseGrey} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ZIFT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.headlineTitle}>Escolha sua{'\n'}Exclusividade</Text>
          <Text style={styles.headlineSubtitle}>
            Eleve sua experiência de presentear com curadoria e inteligência.
          </Text>
        </View>

        {/* Billing Toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[styles.toggleOption, billingCycle === 'monthly' && styles.toggleOptionActive]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.toggleTextActive]}>
                Mensal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, billingCycle === 'yearly' && styles.toggleOptionActive]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text style={[styles.toggleText, billingCycle === 'yearly' && styles.toggleTextActive]}>
                Anual
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-15%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <View 
              key={plan.id} 
              style={[
                styles.planCard,
                plan.tier === 'ouro' && styles.planCardOuro,
                plan.tier === 'platinum' && styles.planCardPlatinum,
              ]}
            >
              {plan.tier === 'platinum' && (
                <LinearGradient
                  colors={['#f4c025', '#544e3b', '#f4c025']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.platinumBorder}
                />
              )}
              
              <View style={[
                styles.planContent,
                plan.tier === 'platinum' && styles.planContentPlatinum,
              ]}>
                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <View style={styles.planTitleRow}>
                    <Text style={[
                      styles.planName,
                      plan.tier === 'ouro' && styles.planNameOuro,
                      plan.tier === 'platinum' && styles.planNamePlatinum,
                    ]}>
                      {plan.name.toUpperCase()}
                    </Text>
                    {plan.exclusive && (
                      <View style={styles.exclusiveBadge}>
                        <Ionicons name="lock-closed" size={10} color={theme.colors.primary} />
                        <Text style={styles.exclusiveText}>Exclusivo</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>R$ {getPrice(plan)}</Text>
                    <Text style={styles.pricePeriod}>/mês</Text>
                  </View>
                  {plan.tier === 'platinum' && (
                    <Text style={styles.platinumTagline}>Para quem exige o extraordinário.</Text>
                  )}
                </View>

                {/* Divider */}
                <View style={[
                  styles.divider,
                  plan.tier === 'ouro' && styles.dividerOuro,
                  plan.tier === 'platinum' && styles.dividerPlatinum,
                ]} />

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons 
                        name={plan.tier === 'ouro' || plan.tier === 'platinum' ? 'checkmark-circle' : 'checkmark'} 
                        size={20} 
                        color={
                          plan.tier === 'ouro' || plan.tier === 'platinum' 
                            ? theme.colors.primary 
                            : plan.tier === 'prata' 
                              ? '#d1d5db' 
                              : 'rgba(255,255,255,0.4)'
                        } 
                      />
                      <Text style={[
                        styles.featureText,
                        plan.tier === 'prata' && styles.featureTextPrata,
                        (plan.tier === 'ouro' || plan.tier === 'platinum') && styles.featureTextHighlight,
                      ]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    plan.tier === 'bronze' && styles.ctaButtonBronze,
                    plan.tier === 'prata' && styles.ctaButtonPrata,
                    plan.tier === 'ouro' && styles.ctaButtonOuro,
                    plan.tier === 'platinum' && styles.ctaButtonPlatinum,
                  ]}
                  onPress={() => handleSubscribe(plan)}
                >
                  <Text style={[
                    styles.ctaText,
                    plan.tier === 'platinum' && styles.ctaTextPlatinum,
                  ]}>
                    {plan.tier === 'ouro' ? 'Fazer Upgrade' : plan.tier === 'platinum' ? 'Quero Platinum' : `Assinar ${plan.name}`}
                  </Text>
                  {plan.tier === 'platinum' && (
                    <Ionicons name="arrow-forward" size={18} color="#000" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A assinatura é renovada automaticamente. Cancele a qualquer momento nas configurações.
          </Text>
          <TouchableOpacity>
            <Text style={styles.restoreLink}>Restaurar Compras</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
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
  headline: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  headlineTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
  },
  headlineSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
  },
  toggleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#2a261e',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleOption: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    position: 'relative',
  },
  toggleOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
  },
  toggleTextActive: {
    color: '#000',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  planCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#221e16',
    overflow: 'hidden',
  },
  planCardOuro: {
    borderColor: 'rgba(244, 192, 37, 0.2)',
    backgroundColor: '#272318',
  },
  planCardPlatinum: {
    borderWidth: 0,
    padding: 2,
    borderRadius: 14,
  },
  platinumBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  planContent: {
    padding: 24,
  },
  planContentPlatinum: {
    backgroundColor: '#1a1812',
    borderRadius: 10,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  planNameOuro: {
    color: theme.colors.primary,
  },
  planNamePlatinum: {
    color: theme.colors.primary,
    letterSpacing: 3,
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 192, 37, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(244, 192, 37, 0.2)',
  },
  exclusiveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  pricePeriod: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 4,
  },
  platinumTagline: {
    fontSize: 12,
    color: 'rgba(244, 192, 37, 0.8)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  dividerOuro: {
    backgroundColor: 'rgba(244, 192, 37, 0.1)',
  },
  dividerPlatinum: {
    backgroundColor: 'rgba(244, 192, 37, 0.2)',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  featureTextPrata: {
    color: '#e5e7eb',
  },
  featureTextHighlight: {
    color: '#fff',
  },
  ctaButton: {
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaButtonBronze: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ctaButtonPrata: {
    backgroundColor: '#393528',
  },
  ctaButtonOuro: {
    backgroundColor: 'rgba(244, 192, 37, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 192, 37, 0.3)',
  },
  ctaButtonPlatinum: {
    backgroundColor: theme.colors.primary,
    height: 48,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  ctaTextPlatinum: {
    color: '#000',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 32,
    gap: 16,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  restoreLink: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'underline',
  },
});

