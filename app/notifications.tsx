import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'dates',
      title: 'Lembretes de Datas',
      description: '5 e 3 dias antes do evento',
      enabled: true,
    },
    {
      id: 'suggestions',
      title: 'Sugestões de Presentes',
      description: 'Curadoria IA personalizada',
      enabled: true,
    },
    {
      id: 'delivery',
      title: 'Status de Entrega',
      description: 'Rastreamento em tempo real',
      enabled: true,
    },
    {
      id: 'newsletter',
      title: 'Newsletter Exclusive',
      description: 'Tendências e luxo semanal',
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
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
          <Ionicons name="chevron-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Preferências de Alerta</Text>
          <Text style={styles.pageDescription}>
            Personalize como o ZIFT mantém você informado sobre datas especiais e sugestões exclusivas.
          </Text>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          {settings.map((setting) => (
            <View key={setting.id} style={styles.settingCard}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ 
                  false: '#E5E7EB', 
                  true: theme.colors.primary 
                }}
                thumbColor="#fff"
                ios_backgroundColor="#E5E7EB"
                style={styles.switch}
              />
            </View>
          ))}
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            As notificações push podem ser gerenciadas também nos Ajustes do seu dispositivo iOS.
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
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 14,
    color: '#78716C',
    lineHeight: 22,
  },
  settingsList: {
    gap: 20,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  settingInfo: {
    flex: 1,
    gap: 4,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  footerNote: {
    marginTop: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

