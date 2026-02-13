import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Achievement {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  level?: string;
}

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const zCoins = 2450;

  const achievements: Achievement[] = [
    {
      id: '1',
      icon: 'shield',
      title: 'O Cavaleiro',
      description: 'Concedido por nunca esquecer uma data importante nos últimos 12 meses.',
      progress: 12,
      maxProgress: 12,
      completed: true,
      level: 'Completo',
    },
    {
      id: '2',
      icon: 'ribbon',
      title: 'Mestre da Curadoria',
      description: 'Alta satisfação confirmada em presentes enviados com nossa IA.',
      progress: 98,
      maxProgress: 100,
      completed: false,
      level: 'Nível Expert',
    },
    {
      id: '3',
      icon: 'heart',
      title: 'Coração Presente',
      description: 'Mantenha vínculos ativos enviando mimos a cada 3 meses.',
      progress: 2,
      maxProgress: 4,
      completed: false,
      level: 'Em andamento',
    },
  ];

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
        <Text style={styles.headerTitle}>Minhas Conquistas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Z-Coins Hero Section */}
        <View style={styles.heroSection}>
          {/* Background glow */}
          <View style={styles.heroGlow} />
          
          {/* Coin Icon */}
          <View style={styles.coinContainer}>
            <LinearGradient
              colors={['#F9D976', '#C6A664', '#F9D976']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coinGradient}
            >
              <Text style={styles.coinZ}>Z</Text>
            </LinearGradient>
            <View style={styles.coinShine} />
          </View>

          {/* Coin Value */}
          <Text style={styles.coinValue}>{zCoins.toLocaleString('pt-BR')}</Text>
          <View style={styles.coinLabelContainer}>
            <View style={styles.coinDot} />
            <Text style={styles.coinLabel}>Z-MOEDAS DISPONÍVEIS</Text>
            <View style={styles.coinDot} />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Selos de Cuidado</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <View 
              key={achievement.id} 
              style={[
                styles.achievementCard,
                !achievement.completed && achievement.progress < achievement.maxProgress * 0.5 && styles.achievementCardIncomplete,
              ]}
            >
              {achievement.completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                </View>
              )}

              <View style={styles.achievementContent}>
                {/* Icon */}
                <View style={[
                  styles.achievementIcon,
                  !achievement.completed && achievement.progress < achievement.maxProgress * 0.5 && styles.achievementIconIncomplete,
                ]}>
                  <Ionicons 
                    name={achievement.icon} 
                    size={26} 
                    color={achievement.completed || achievement.progress >= achievement.maxProgress * 0.5 
                      ? theme.colors.primary 
                      : `${theme.colors.primary}70`
                    } 
                  />
                </View>

                {/* Info */}
                <View style={styles.achievementInfo}>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.completed && achievement.progress < achievement.maxProgress * 0.5 && styles.achievementTitleIncomplete,
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.completed && achievement.progress < achievement.maxProgress * 0.5 && styles.achievementDescriptionIncomplete,
                  ]}>
                    {achievement.description}
                  </Text>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLevel}>{achievement.level}</Text>
                      <Text style={styles.progressValue}>
                        {achievement.progress}/{achievement.maxProgress}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${(achievement.progress / achievement.maxProgress) * 100}%` },
                          achievement.completed && styles.progressFillComplete,
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quote */}
        <View style={styles.quoteSection}>
          <Text style={styles.quoteText}>
            "A arte de presentear é a linguagem silenciosa do afeto."
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: 'rgba(247, 243, 235, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.primary}15`,
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
    fontWeight: 'bold',
    color: '#3D342B',
    fontStyle: 'italic',
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 192,
    height: 192,
    marginLeft: -96,
    marginTop: -96,
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 96,
    opacity: 0.5,
  },
  coinContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  coinGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C6A664',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  coinZ: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    fontStyle: 'italic',
  },
  coinShine: {
    position: 'absolute',
    top: -4,
    right: 4,
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    opacity: 0.8,
  },
  coinValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3D342B',
  },
  coinLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  coinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  coinLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8A8175',
    letterSpacing: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
    marginTop: 8,
    opacity: 0.6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${theme.colors.primary}40`,
  },
  dividerText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#9E8245',
    paddingHorizontal: 16,
  },
  achievementsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
    shadowColor: '#C6A664',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
    position: 'relative',
  },
  achievementCardIncomplete: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderStyle: 'dashed',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  achievementContent: {
    flexDirection: 'row',
    gap: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCFBF8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  achievementIconIncomplete: {
    opacity: 0.7,
  },
  achievementInfo: {
    flex: 1,
    paddingTop: 2,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D342B',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  achievementTitleIncomplete: {
    opacity: 0.8,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#8A8175',
    lineHeight: 18,
    marginBottom: 16,
    paddingRight: 16,
  },
  achievementDescriptionIncomplete: {
    opacity: 0.8,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLevel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D6A39C',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D6A39C',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#EBE5D9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D6A39C',
    borderRadius: 2,
  },
  progressFillComplete: {
    shadowColor: '#D6A39C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  quoteSection: {
    paddingVertical: 40,
    paddingHorizontal: 40,
    alignItems: 'center',
    opacity: 0.6,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#8A8175',
    textAlign: 'center',
    lineHeight: 20,
  },
});

