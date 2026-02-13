import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Person {
  id: string;
  name: string;
  initials: string;
  relationship: string;
  photo?: string;
  event: {
    icon: keyof typeof Ionicons.glyphMap;
    name: string;
    date: string;
    daysLeft?: number;
    highlight?: boolean;
  };
}

export default function SpecialPeopleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const people: Person[] = [
    {
      id: '1',
      name: 'Isabella Vilanova',
      initials: 'IV',
      relationship: 'Esposa',
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBN3bkI4YB2mGpxJ-9PNaI2z-JCzIs6_jtDPm2lPQqV6Q0TX1_4SjN5IZ74qBzCWznvh6gqXa97uAf1uCN2Y_kzzYWbW35OvHtyXzRokyEtFKkdgfZiORY0mh-KyevJaedWZY7nHiz9SqTXFJDuti_yIWJi6W9Amkj74Rsh95TOZFACH0MVSrKm085xoKNjf0jN2-oLA2E8i2feuAr14XXIqZo2wfw5VZiuhtOKB5bGJJYiOv2vfVUJ92Kie2jrEELXrCEm-0D53g',
      event: {
        icon: 'gift',
        name: 'Aniversário',
        date: '24 Outubro',
        daysLeft: 12,
        highlight: true,
      },
    },
    {
      id: '2',
      name: 'Roberto Vilanova',
      initials: 'RV',
      relationship: 'Pai',
      event: {
        icon: 'calendar',
        name: 'Bodas de Ouro',
        date: '15 Dezembro',
      },
    },
    {
      id: '3',
      name: 'Luísa Costa',
      initials: 'LC',
      relationship: 'Filha',
      event: {
        icon: 'school',
        name: 'Formatura',
        date: '02 Fevereiro',
      },
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
        <Text style={styles.headerTitle}>Pessoas Especiais</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>
            Gerencie os perfis de quem você ama para receber recomendações de presentes exclusivos e lembretes de datas importantes.
          </Text>
        </View>

        {/* Add New Person Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-person')}
          activeOpacity={0.8}
        >
          <View style={styles.addButtonGlow} />
          <View style={styles.addButtonContent}>
            <LinearGradient
              colors={['#f4c025', '#d4a015']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonIcon}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.addButtonText}>
              <Text style={styles.addButtonTitle}>Adicionar Nova Pessoa</Text>
              <Text style={styles.addButtonSubtitle}>Cadastre um novo perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={`${theme.colors.primary}80`} />
          </View>
        </TouchableOpacity>

        {/* People List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>SEUS PERFIS</Text>

          {people.map((person) => (
            <TouchableOpacity 
              key={person.id}
              style={styles.personCard}
              activeOpacity={0.8}
            >
              <View style={styles.personContent}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  {person.photo ? (
                    <Image 
                      source={{ uri: person.photo }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarInitials}>
                      <Text style={styles.initialsText}>{person.initials}</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.personInfo}>
                  <View style={styles.personHeader}>
                    <View>
                      <Text style={styles.personName}>{person.name}</Text>
                      <Text style={styles.personRelationship}>{person.relationship}</Text>
                    </View>
                  </View>

                  {/* Event */}
                  <View style={[
                    styles.eventRow,
                    person.event.highlight && styles.eventRowHighlight
                  ]}>
                    <Ionicons 
                      name={person.event.icon} 
                      size={16} 
                      color={person.event.highlight ? theme.colors.primary : '#9CA3AF'}
                      style={person.event.highlight && { opacity: 1 }}
                    />
                    <Text style={[
                      styles.eventText,
                      person.event.highlight && styles.eventTextHighlight
                    ]}>
                      {person.event.name}: {person.event.date}
                    </Text>
                    {person.event.daysLeft && (
                      <View style={styles.daysLeftBadge}>
                        <Text style={styles.daysLeftText}>
                          Faltam {person.event.daysLeft} dias
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SINCRONIZADO COM AGENDA</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
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
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 14,
    color: '#78716C',
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
    padding: 4,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  addButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${theme.colors.primary}08`,
    opacity: 0.5,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 16,
  },
  addButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    flex: 1,
  },
  addButtonTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginBottom: 2,
  },
  addButtonSubtitle: {
    fontSize: 12,
    color: '#78716C',
  },
  listSection: {
    gap: 16,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  personCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  personContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarInitials: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  personInfo: {
    flex: 1,
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  personName: {
    fontSize: 20,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  personRelationship: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  eventRowHighlight: {
    color: theme.colors.primary,
  },
  eventText: {
    fontSize: 12,
    color: '#78716C',
    fontWeight: '500',
  },
  eventTextHighlight: {
    color: theme.colors.primary,
  },
  daysLeftBadge: {
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 'auto',
  },
  daysLeftText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#B8860B',
  },
  footer: {
    paddingTop: 40,
    paddingBottom: 16,
    alignItems: 'center',
    opacity: 0.6,
  },
  footerText: {
    fontSize: 10,
    color: '#D1D5DB',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

