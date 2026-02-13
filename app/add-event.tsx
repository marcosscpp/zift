import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { saveEvent, EventType, EVENT_TYPE_LABELS } from '../lib/events';
import { getPresenteados, Presenteado } from '../lib/presenteados';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EventTypeOption {
  id: EventType;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const EVENT_TYPES: EventTypeOption[] = [
  { id: 'aniversario', icon: 'gift', label: 'Aniversario' },
  { id: 'casamento', icon: 'heart', label: 'Casamento' },
  { id: 'namoro', icon: 'heart-circle', label: 'Namoro' },
  { id: 'formatura', icon: 'school', label: 'Formatura' },
  { id: 'natal', icon: 'snow', label: 'Natal' },
  { id: 'dia_maes', icon: 'flower', label: 'Dia das Maes' },
  { id: 'dia_pais', icon: 'man', label: 'Dia dos Pais' },
  { id: 'amigo_secreto', icon: 'people-circle', label: 'Amigo Secreto' },
  { id: 'outro', icon: 'calendar', label: 'Outro' },
];

export default function AddEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ personId?: string }>();
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventType, setEventType] = useState<EventType>('aniversario');
  const [notes, setNotes] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(params.personId || '');
  const [presenteados, setPresenteados] = useState<Presenteado[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPersonPicker, setShowPersonPicker] = useState(false);

  useEffect(() => {
    getPresenteados()
      .then(setPresenteados)
      .catch(() => setPresenteados([]));
  }, []);

  const selectedPerson = presenteados.find((p) => p.id === selectedPersonId);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o titulo do evento.');
      return;
    }
    if (!eventDate) {
      Alert.alert('Erro', 'Por favor, selecione uma data.');
      return;
    }
    if (!selectedPersonId) {
      Alert.alert('Erro', 'Por favor, selecione uma pessoa especial.');
      return;
    }

    try {
      setIsSaving(true);
      const person = presenteados.find((p) => p.id === selectedPersonId);
      await saveEvent({
        id: String(Date.now()),
        title: title.trim(),
        date: formatDate(eventDate),
        type: eventType,
        personId: selectedPersonId,
        personName: person?.name || '',
        notes: notes.trim() || undefined,
        completed: false,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Sucesso!', 'Evento adicionado ao calendario.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o evento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/calendar')}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Evento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headline}>
          <Text style={styles.headlineTitle}>Criar Evento</Text>
          <Text style={styles.headlineSubtitle}>
            Adicione uma data especial ao calendario
          </Text>
        </View>

        <View style={styles.form}>
          {/* Person Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pessoa Especial</Text>
            {presenteados.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyPersonCard}
                onPress={() => router.push('/add-person')}
              >
                <Ionicons name="person-add" size={24} color={theme.colors.primary} />
                <Text style={styles.emptyPersonText}>
                  Adicione uma pessoa especial primeiro
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.personSelector}
                  onPress={() => setShowPersonPicker(!showPersonPicker)}
                >
                  {selectedPerson ? (
                    <View style={styles.selectedPersonRow}>
                      <View style={styles.personAvatar}>
                        <Ionicons name="person" size={18} color={theme.colors.primary} />
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{selectedPerson.name}</Text>
                        {selectedPerson.relationship && (
                          <Text style={styles.personRelation}>
                            {selectedPerson.relationship}
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.placeholderText}>Selecionar pessoa</Text>
                  )}
                  <Ionicons
                    name={showPersonPicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.roseGrey}
                  />
                </TouchableOpacity>

                {showPersonPicker && (
                  <View style={styles.personList}>
                    {presenteados.map((person) => (
                      <TouchableOpacity
                        key={person.id}
                        style={[
                          styles.personItem,
                          selectedPersonId === person.id && styles.personItemActive,
                        ]}
                        onPress={() => {
                          setSelectedPersonId(person.id);
                          setShowPersonPicker(false);
                        }}
                      >
                        <View style={styles.personAvatar}>
                          <Ionicons name="person" size={16} color={theme.colors.primary} />
                        </View>
                        <Text
                          style={[
                            styles.personItemText,
                            selectedPersonId === person.id && styles.personItemTextActive,
                          ]}
                        >
                          {person.name}
                        </Text>
                        {selectedPersonId === person.id && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={theme.colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Titulo do Evento</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Aniversario da Maria"
                placeholderTextColor={theme.colors.roseGrey}
                value={title}
                onChangeText={setTitle}
              />
              <Ionicons name="create-outline" size={20} color={theme.colors.roseGrey} />
            </View>
          </View>

          {/* Event Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Data do Evento</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !eventDate && styles.placeholderText]}>
                {eventDate ? formatDate(eventDate) : 'Selecionar data'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.roseGrey} />
            </TouchableOpacity>

            {showDatePicker && (
              <View>
                <DateTimePicker
                  value={eventDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  locale="pt-BR"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.datePickerDone}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Confirmar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Event Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de Evento</Text>
            <View style={styles.eventTypeGrid}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.eventTypeCard,
                    eventType === type.id && styles.eventTypeCardActive,
                  ]}
                  onPress={() => setEventType(type.id)}
                >
                  {eventType === type.id && <View style={styles.eventTypeIndicator} />}
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={
                      eventType === type.id ? theme.colors.primary : theme.colors.roseGrey
                    }
                  />
                  <Text
                    style={[
                      styles.eventTypeLabel,
                      eventType === type.id && styles.eventTypeLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Observacoes (opcional)</Text>
            <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start' }]}>
              <TextInput
                style={[styles.input, { textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Ideias de presente, preferencias..."
                placeholderTextColor={theme.colors.roseGrey}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footerGradient, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Salvando...' : 'Adicionar Evento'}
          </Text>
          <Ionicons name="add-circle" size={20} color="#fff" />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: theme.colors.backgroundLight,
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
    color: theme.colors.textMain,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headline: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  headlineTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: theme.colors.textMain,
    textAlign: 'center',
  },
  headlineSubtitle: {
    fontSize: 14,
    color: theme.colors.roseGrey,
    marginTop: 8,
  },
  form: {
    gap: 28,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textMain,
  },
  placeholderText: {
    color: theme.colors.roseGrey,
  },
  datePickerDone: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    marginTop: 8,
  },
  datePickerDoneText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Person selector
  emptyPersonCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  emptyPersonText: {
    fontSize: 14,
    color: theme.colors.roseGrey,
  },
  personSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  selectedPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInfo: {
    gap: 2,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  personRelation: {
    fontSize: 12,
    color: theme.colors.roseGrey,
  },
  personList: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    overflow: 'hidden',
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.champagneBorder,
  },
  personItemActive: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  personItemText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textMain,
  },
  personItemTextActive: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  // Event types
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  eventTypeCard: {
    width: '31%',
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    backgroundColor: theme.colors.surfaceLight,
    gap: 6,
    position: 'relative',
  },
  eventTypeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  eventTypeIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  eventTypeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMain,
    textAlign: 'center',
  },
  eventTypeLabelActive: {
    color: theme.colors.primary,
  },
  // Footer
  footerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    backgroundColor: theme.colors.backgroundLight,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
