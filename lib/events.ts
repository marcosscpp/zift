import AsyncStorage from '@react-native-async-storage/async-storage';

export type EventType =
  | 'aniversario'
  | 'casamento'
  | 'namoro'
  | 'formatura'
  | 'natal'
  | 'dia_maes'
  | 'dia_pais'
  | 'amigo_secreto'
  | 'outro';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // DD/MM/YYYY
  type: EventType;
  personId: string;
  personName: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'zift_events_v1';

const safeParse = (value: string | null): CalendarEvent[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getEvents = async (): Promise<CalendarEvent[]> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return safeParse(stored);
};

export const saveEvent = async (item: CalendarEvent): Promise<CalendarEvent[]> => {
  const current = await getEvents();
  const next = [item, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent[]> => {
  const current = await getEvents();
  const next = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const deleteEvent = async (id: string): Promise<CalendarEvent[]> => {
  const current = await getEvents();
  const next = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const getEventsByPerson = async (personId: string): Promise<CalendarEvent[]> => {
  const all = await getEvents();
  return all.filter((e) => e.personId === personId);
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  aniversario: 'Aniversario',
  casamento: 'Casamento',
  namoro: 'Namoro',
  formatura: 'Formatura',
  natal: 'Natal',
  dia_maes: 'Dia das Maes',
  dia_pais: 'Dia dos Pais',
  amigo_secreto: 'Amigo Secreto',
  outro: 'Outro',
};

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  aniversario: 'gift',
  casamento: 'heart',
  namoro: 'heart-circle',
  formatura: 'school',
  natal: 'snow',
  dia_maes: 'flower',
  dia_pais: 'man',
  amigo_secreto: 'people-circle',
  outro: 'calendar',
};
