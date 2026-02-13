import AsyncStorage from '@react-native-async-storage/async-storage';

export type Presenteado = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthday?: string;
  relationship?: string;
  photoUri?: string;
  createdAt: string;
  shoeSize?: string;
  shirtSize?: string;
  pantsSize?: string;
  dressSize?: string;
  ringSize?: string;
  observations?: string;
  lifestyles?: string[];
};

const STORAGE_KEY = 'zift_presenteados_v1';

const safeParse = (value: string | null): Presenteado[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getPresenteados = async (): Promise<Presenteado[]> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return safeParse(stored);
};

export const savePresenteado = async (item: Presenteado): Promise<Presenteado[]> => {
  const current = await getPresenteados();
  const next = [item, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const updatePresenteado = async (
  id: string,
  updates: Partial<Presenteado>
): Promise<Presenteado[]> => {
  const current = await getPresenteados();
  const next = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const deletePresenteado = async (id: string): Promise<Presenteado[]> => {
  const current = await getPresenteados();
  const next = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};


