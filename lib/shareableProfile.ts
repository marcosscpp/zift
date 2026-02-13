import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Presenteado } from './presenteados';

export type ShareableProfile = {
  id: string;
  personId: string;
  personName: string;
  shareCode: string;
  wishlist: WishlistItem[];
  preferences: ProfilePreferences;
  createdAt: string;
  updatedAt: string;
};

export type WishlistItem = {
  id: string;
  name: string;
  description?: string;
  link?: string;
  priceRange?: string;
  priority: 'alta' | 'media' | 'baixa';
  addedAt: string;
};

export type ProfilePreferences = {
  favoriteColors?: string[];
  interests?: string[];
  dislikes?: string[];
  allergies?: string[];
  notes?: string;
};

const STORAGE_KEY = 'zift_shareable_profiles_v1';

const safeParse = (value: string | null): ShareableProfile[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const generateShareCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getShareableProfiles = async (): Promise<ShareableProfile[]> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return safeParse(stored);
};

export const getProfileByPerson = async (personId: string): Promise<ShareableProfile | null> => {
  const profiles = await getShareableProfiles();
  return profiles.find((p) => p.personId === personId) || null;
};

export const getProfileByCode = async (code: string): Promise<ShareableProfile | null> => {
  const profiles = await getShareableProfiles();
  return profiles.find((p) => p.shareCode === code.toUpperCase()) || null;
};

export const createShareableProfile = async (
  person: Presenteado
): Promise<ShareableProfile> => {
  const existing = await getProfileByPerson(person.id);
  if (existing) return existing;

  const profile: ShareableProfile = {
    id: String(Date.now()),
    personId: person.id,
    personName: person.name,
    shareCode: generateShareCode(),
    wishlist: [],
    preferences: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const profiles = await getShareableProfiles();
  profiles.push(profile);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profile;
};

export const addToWishlist = async (
  profileId: string,
  item: Omit<WishlistItem, 'id' | 'addedAt'>
): Promise<ShareableProfile | null> => {
  const profiles = await getShareableProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return null;

  const newItem: WishlistItem = {
    ...item,
    id: String(Date.now()),
    addedAt: new Date().toISOString(),
  };

  profiles[idx].wishlist.push(newItem);
  profiles[idx].updatedAt = new Date().toISOString();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profiles[idx];
};

export const removeFromWishlist = async (
  profileId: string,
  itemId: string
): Promise<ShareableProfile | null> => {
  const profiles = await getShareableProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return null;

  profiles[idx].wishlist = profiles[idx].wishlist.filter((w) => w.id !== itemId);
  profiles[idx].updatedAt = new Date().toISOString();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profiles[idx];
};

export const updatePreferences = async (
  profileId: string,
  prefs: Partial<ProfilePreferences>
): Promise<ShareableProfile | null> => {
  const profiles = await getShareableProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return null;

  profiles[idx].preferences = { ...profiles[idx].preferences, ...prefs };
  profiles[idx].updatedAt = new Date().toISOString();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profiles[idx];
};

export const getShareLink = (shareCode: string): string => {
  return Linking.createURL(`/shared-profile?code=${shareCode}`);
};
