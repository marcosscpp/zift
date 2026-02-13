import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PrivacyOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  isDanger?: boolean;
}

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const options: PrivacyOption[] = [
    {
      id: 'consent',
      icon: 'settings-outline',
      title: 'Gerenciar Consentimentos',
    },
    {
      id: 'data-copy',
      icon: 'document-text-outline',
      title: 'Solicitar Cópia de Dados',
    },
  ];

  const handleOptionPress = (option: PrivacyOption) => {
    if (option.id === 'consent') {
      Alert.alert(
        'Consentimentos',
        'Gerencie suas preferências de compartilhamento de dados.',
        [{ text: 'OK' }]
      );
    } else if (option.id === 'data-copy') {
      Alert.alert(
        'Solicitar Dados',
        'Uma cópia de seus dados será enviada para seu e-mail em até 15 dias úteis.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Solicitar', onPress: () => Alert.alert('Sucesso', 'Solicitação enviada com sucesso!') }
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmação',
              'Sua solicitação de exclusão foi recebida. Sua conta será removida em até 30 dias.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidade e LGPD</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <View style={styles.iconRing}>
              <Ionicons name="lock-closed-outline" size={40} color={theme.colors.primary} />
            </View>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Privacidade Absoluta</Text>
            <Text style={styles.heroQuote}>
              "No ZIFT, a confidencialidade é o verdadeiro luxo. Seus dados são protegidos com rigor e transparência."
            </Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsSection}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={theme.colors.textMain}
                    style={{ opacity: 0.7 }}
                  />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.dangerCard}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons 
                  name="person-remove-outline" 
                  size={24} 
                  color="#991B1B"
                  style={{ opacity: 0.8 }}
                />
              </View>
              <Text style={styles.dangerTitle}>Excluir Minha Conta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(153, 27, 27, 0.3)" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            COMPLIANCE LGPD • PROTEÇÃO DE DADOS
          </Text>
          <Text style={styles.footerVersion}>
            ZIFT Security v2.4
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: `${theme.colors.backgroundLight}E8`,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 4,
  },
  heroText: {
    alignItems: 'center',
    maxWidth: 280,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroQuote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '300',
  },
  optionsSection: {
    gap: 12,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIcon: {
    width: 24,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 18,
    color: theme.colors.textMain,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(153, 27, 27, 0.1)',
    marginTop: 16,
  },
  dangerTitle: {
    fontSize: 18,
    color: 'rgba(153, 27, 27, 0.8)',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 40,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 10,
    color: '#D1D5DB',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerVersion: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 4,
  },
});

