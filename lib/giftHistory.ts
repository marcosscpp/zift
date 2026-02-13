import AsyncStorage from '@react-native-async-storage/async-storage';

export type GiftRecord = {
  id: string;
  personId: string;
  personName: string;
  giftName: string;
  description?: string;
  price?: number;
  date: string; // DD/MM/YYYY
  occasion?: string;
  liked?: boolean; // se a pessoa gostou
  notes?: string;
  createdAt: string;
};

const STORAGE_KEY = 'zift_gift_history_v1';

const safeParse = (value: string | null): GiftRecord[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getGiftHistory = async (): Promise<GiftRecord[]> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return safeParse(stored);
};

export const saveGiftRecord = async (item: GiftRecord): Promise<GiftRecord[]> => {
  const current = await getGiftHistory();
  const next = [item, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const updateGiftRecord = async (id: string, updates: Partial<GiftRecord>): Promise<GiftRecord[]> => {
  const current = await getGiftHistory();
  const next = current.map((g) => (g.id === id ? { ...g, ...updates } : g));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const deleteGiftRecord = async (id: string): Promise<GiftRecord[]> => {
  const current = await getGiftHistory();
  const next = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const getGiftsByPerson = async (personId: string): Promise<GiftRecord[]> => {
  const all = await getGiftHistory();
  return all.filter((g) => g.personId === personId);
};

export const getTotalSpentOnPerson = async (personId: string): Promise<number> => {
  const gifts = await getGiftsByPerson(personId);
  return gifts.reduce((sum, g) => sum + (g.price || 0), 0);
};
