import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getPresenteados, Presenteado } from '../lib/presenteados';
import { getEvents, CalendarEvent, EVENT_TYPE_LABELS } from '../lib/events';

const { width } = Dimensions.get('window');

type EventStatus = 'urgent' | 'soon' | 'pending' | 'today' | 'passed' | 'completed';

interface DisplayEvent {
  day: number;
  month: string;
  title: string;
  status: EventStatus;
  completed: boolean;
  daysUntil: number;
  personId?: string;
  personName?: string;
  eventType?: string;
  sourceType: 'birthday' | 'custom';
}

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [presenteados, setPresenteados] = useState<Presenteado[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [zMoedas] = useState(4500);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([getPresenteados(), getEvents()])
        .then(([people, events]) => {
          if (isActive) {
            setPresenteados(people);
            setCalendarEvents(events);
          }
        })
        .catch(() => {
          if (isActive) {
            setPresenteados([]);
            setCalendarEvents([]);
          }
        });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const currentMonth = useMemo(() => {
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const daysInMonth = useMemo(() => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
  }, [currentDate]);

  const getDaysUntilDate = (dateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [day, month, year] = dateStr.split('/').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilBirthday = (birthday: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [day, month] = birthday.split('/').map(Number);
    const thisYear = today.getFullYear();

    let nextBirthday = new Date(thisYear, month - 1, day);
    nextBirthday.setHours(0, 0, 0, 0);

    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, month - 1, day);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusFromDays = (daysUntil: number, completed: boolean): EventStatus => {
    if (completed) return 'completed';
    if (daysUntil === 0) return 'today';
    if (daysUntil < 0) return 'passed';
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'soon';
    return 'pending';
  };

  const events = useMemo(() => {
    const monthAbbr = currentDate.toLocaleDateString('pt-BR', { month: 'short' });
    const viewMonth = currentDate.getMonth();
    const viewYear = currentDate.getFullYear();
    const allEvents: DisplayEvent[] = [];

    // Birthday events from presenteados
    presenteados
      .filter((p) => p.birthday)
      .forEach((person) => {
        const [day, month] = person.birthday!.split('/').map(Number);
        if (month - 1 === viewMonth) {
          const daysUntil = getDaysUntilBirthday(person.birthday!);
          allEvents.push({
            day,
            month: monthAbbr,
            title: `Aniversario de ${person.name}`,
            status: getStatusFromDays(daysUntil, false),
            completed: false,
            daysUntil,
            personId: person.id,
            personName: person.name,
            sourceType: 'birthday',
          });
        }
      });

    // Custom events
    calendarEvents.forEach((evt) => {
      const [day, month, year] = evt.date.split('/').map(Number);
      if (month - 1 === viewMonth && year === viewYear) {
        const daysUntil = getDaysUntilDate(evt.date);
        allEvents.push({
          day,
          month: monthAbbr,
          title: evt.title,
          status: getStatusFromDays(daysUntil, evt.completed),
          completed: evt.completed,
          daysUntil,
          personId: evt.personId,
          personName: evt.personName,
          eventType: EVENT_TYPE_LABELS[evt.type],
          sourceType: 'custom',
        });
      }
    });

    // Also show recurring custom events (non-year-specific check for birthdays of next year)
    calendarEvents.forEach((evt) => {
      const [day, month, year] = evt.date.split('/').map(Number);
      // Show events from other years if they match the month (recurring annual events)
      if (month - 1 === viewMonth && year !== viewYear && evt.type === 'aniversario') {
        const birthdayStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${viewYear}`;
        const daysUntil = getDaysUntilDate(birthdayStr);
        // Avoid duplicates
        const exists = allEvents.some(
          (e) => e.day === day && e.personId === evt.personId && e.sourceType === 'custom'
        );
        if (!exists) {
          allEvents.push({
            day,
            month: monthAbbr,
            title: evt.title,
            status: getStatusFromDays(daysUntil, evt.completed),
            completed: evt.completed,
            daysUntil,
            personId: evt.personId,
            personName: evt.personName,
            eventType: EVENT_TYPE_LABELS[evt.type],
            sourceType: 'custom',
          });
        }
      }
    });

    return allEvents.sort((a, b) => a.day - b.day);
  }, [currentDate, presenteados, calendarEvents]);

  // Map of day -> array of event statuses for that day
  const eventDaysMap = useMemo(() => {
    const map: Record<number, EventStatus[]> = {};
    events.forEach((event) => {
      if (!map[event.day]) map[event.day] = [];
      map[event.day].push(event.status);
    });
    return map;
  }, [events]);

  const getStatusConfig = (status: EventStatus) => {
    switch (status) {
      case 'today':
        return {
          label: 'E HOJE!',
          color: theme.colors.primary,
          bgColor: `${theme.colors.primary}20`,
          icon: 'gift' as const,
          subtitle: 'Nao esqueca de presentear!',
        };
      case 'urgent':
        return {
          label: 'URGENTE',
          color: theme.colors.error,
          bgColor: `${theme.colors.error}15`,
          icon: 'alert-circle' as const,
          subtitle: 'Esta chegando! Compre agora',
        };
      case 'soon':
        return {
          label: 'EM BREVE',
          color: theme.colors.warning,
          bgColor: `${theme.colors.warning}15`,
          icon: 'time' as const,
          subtitle: 'Planeje com antecedencia',
        };
      case 'pending':
        return {
          label: 'PLANEJADO',
          color: theme.colors.roseGrey,
          bgColor: theme.colors.backgroundLight,
          icon: 'calendar-outline' as const,
          subtitle: 'Ainda tem tempo',
        };
      case 'passed':
        return {
          label: 'PASSOU',
          color: theme.colors.textMuted,
          bgColor: theme.colors.backgroundLight,
          icon: 'alert' as const,
          subtitle: 'Data ja passou',
        };
      case 'completed':
        return {
          label: 'ENVIADO',
          color: theme.colors.success,
          bgColor: `${theme.colors.success}15`,
          icon: 'checkmark-circle' as const,
          subtitle: 'Presente enviado',
        };
    }
  };

  const getPriorityStatus = (statuses: EventStatus[]): EventStatus => {
    const priority: EventStatus[] = ['today', 'urgent', 'soon', 'pending', 'passed', 'completed'];
    for (const p of priority) {
      if (statuses.includes(p)) return p;
    }
    return 'pending';
  };

  const formatDaysUntil = (days: number): string => {
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanha';
    if (days < 0) return `Ha ${Math.abs(days)} dias`;
    if (days <= 7) return `Em ${days} dias`;
    if (days <= 30) return `Em ${Math.ceil(days / 7)} semanas`;
    return `Em ${Math.ceil(days / 30)} meses`;
  };

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();
  const todayDay = today.getDate();

  return (
    <View style={styles.container}>
      <Header
        title="Calendario Zift"
        onBack={() => {
          try {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          } catch {
            router.replace('/');
          }
        }}
        showBack={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Pessoas Especiais</Text>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
              </View>
            </View>
            <Text style={styles.statValue}>{presenteados.length}</Text>
            <Text style={styles.statSubtext}>cadastradas</Text>

            <View style={styles.statActionsColumn}>
              <TouchableOpacity
                style={styles.actionButtonFull}
                onPress={() => router.push('/presenteados')}
              >
                <Ionicons name="list" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonTextLight}>Ver lista</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonOutline}
                onPress={() => router.push('/add-person')}
              >
                <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.actionButtonTextPrimary}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Z-Moedas</Text>
              <View style={styles.statIconContainer}>
                <Ionicons name="wallet" size={20} color={theme.colors.primary} />
              </View>
            </View>
            <Text style={styles.statValueLarge}>{zMoedas.toLocaleString('pt-BR')}</Text>
            <Text style={styles.statSubtext}>disponiveis</Text>

            <TouchableOpacity
              style={styles.actionButtonOutline}
              onPress={() => router.push('/achievements')}
            >
              <Ionicons name="trophy-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.actionButtonTextPrimary}>Ver conquistas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={() => navigateMonth('prev')}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.textMain} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
            </Text>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={() => navigateMonth('next')}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMain} />
            </TouchableOpacity>
          </View>

          <View style={styles.daysHeader}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
              <Text key={index} style={styles.dayHeaderText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {Array(firstDayOfMonth)
              .fill(null)
              .map((_, i) => (
                <View key={`empty-${i}`} style={styles.calendarDay} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayStatuses = eventDaysMap[day];
              const hasEvent = !!dayStatuses && dayStatuses.length > 0;
              const isToday = isCurrentMonth && day === todayDay;
              const eventCount = dayStatuses ? dayStatuses.length : 0;

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.calendarDay}
                  onPress={() => {
                    if (hasEvent) {
                      router.push('/experimenta');
                    }
                  }}
                >
                  {hasEvent ? (
                    <View
                      style={[
                        styles.eventDayContainer,
                        {
                          backgroundColor: getStatusConfig(
                            getPriorityStatus(dayStatuses)
                          ).bgColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.eventDayNumber,
                          {
                            color: getStatusConfig(getPriorityStatus(dayStatuses)).color,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                      {eventCount > 1 && (
                        <View style={styles.eventCountBadge}>
                          <Text style={styles.eventCountText}>{eventCount}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={[isToday && styles.todayContainer]}>
                      <Text style={[styles.dayText, isToday && styles.todayText]}>
                        {day}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.legendText}>Urgente</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.legendText}>Em breve</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>Hoje</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.legendText}>Enviado</Text>
            </View>
          </View>
        </View>

        {/* Add Event Button */}
        <TouchableOpacity
          style={styles.addEventButton}
          onPress={() => router.push('/add-event')}
          activeOpacity={0.7}
        >
          <View style={styles.addEventIconContainer}>
            <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.addEventContent}>
            <Text style={styles.addEventTitle}>Adicionar Evento</Text>
            <Text style={styles.addEventSubtitle}>
              Crie um evento para uma pessoa especial
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.roseGrey} />
        </TouchableOpacity>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Proximos Eventos</Text>

          {events.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={theme.colors.champagneBorder}
              />
              <Text style={styles.emptyText}>Nenhum evento este mes</Text>
              <Text style={styles.emptySubtext}>
                Adicione pessoas e eventos para ver aqui
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => router.push('/add-event')}
              >
                <Ionicons name="add" size={18} color={theme.colors.primary} />
                <Text style={styles.emptyAddButtonText}>Criar evento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            events.map((event, index) => {
              const config = getStatusConfig(event.status);
              return (
                <TouchableOpacity
                  key={`${event.sourceType}-${event.personId}-${event.day}-${index}`}
                  style={[styles.eventCard, { borderLeftColor: config.color }]}
                  onPress={() => {
                    if (!event.completed) {
                      router.push('/experimenta');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventLeft}>
                    <View style={styles.eventDate}>
                      <Text style={styles.eventDay}>{event.day}</Text>
                      <Text style={styles.eventMonth}>{event.month}</Text>
                    </View>
                  </View>

                  <View style={styles.eventContent}>
                    <Text
                      style={[
                        styles.eventTitle,
                        event.completed && styles.eventTitleCompleted,
                      ]}
                    >
                      {event.title}
                    </Text>
                    {event.personName && (
                      <View style={styles.eventPersonRow}>
                        <Ionicons name="person" size={12} color={theme.colors.roseGrey} />
                        <Text style={styles.eventPersonName}>{event.personName}</Text>
                        {event.eventType && (
                          <Text style={styles.eventTypeBadge}>{event.eventType}</Text>
                        )}
                      </View>
                    )}
                    <Text style={styles.eventSubtitle}>{config.subtitle}</Text>

                    <View style={styles.eventFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                        <Ionicons name={config.icon} size={12} color={config.color} />
                        <Text style={[styles.statusText, { color: config.color }]}>
                          {config.label}
                        </Text>
                      </View>
                      <Text style={styles.daysUntilText}>
                        {formatDaysUntil(event.daysUntil)}
                      </Text>
                    </View>
                  </View>

                  {!event.completed && (
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.roseGrey} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <BottomNav active="calendar" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 42,
    fontWeight: '200',
    color: theme.colors.textMain,
    letterSpacing: -2,
    lineHeight: 48,
  },
  statValueLarge: {
    fontSize: 36,
    fontWeight: '300',
    color: theme.colors.textMain,
    letterSpacing: -1,
    lineHeight: 42,
  },
  statSubtext: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    marginBottom: 12,
  },
  statActionsColumn: {
    gap: 8,
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  actionButtonTextLight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.champagneBorder,
  },
  dayHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: theme.colors.textMain,
  },
  todayContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  todayText: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  eventDayContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  eventDayNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  eventCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.champagneBorder,
    flexWrap: 'wrap',
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
    fontSize: 11,
    color: theme.colors.roseGrey,
  },
  // Add Event Button
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderStyle: 'dashed',
  },
  addEventIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addEventContent: {
    flex: 1,
  },
  addEventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  addEventSubtitle: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    marginTop: 2,
  },
  // Events section
  eventsSection: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 16,
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.roseGrey,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  emptyAddButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderLeftWidth: 4,
  },
  eventLeft: {
    marginRight: 16,
  },
  eventDate: {
    alignItems: 'center',
    minWidth: 44,
  },
  eventDay: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textMain,
    lineHeight: 28,
  },
  eventMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.roseGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginBottom: 2,
  },
  eventTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  eventPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  eventPersonName: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    fontWeight: '500',
  },
  eventTypeBadge: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '600',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
    overflow: 'hidden',
  },
  eventSubtitle: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  daysUntilText: {
    fontSize: 11,
    color: theme.colors.roseGrey,
    fontWeight: '500',
  },
});
