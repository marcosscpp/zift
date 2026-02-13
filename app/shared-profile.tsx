import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getPresenteados, Presenteado } from '../lib/presenteados';
import {
  createShareableProfile,
  getProfileByPerson,
  getProfileByCode,
  addToWishlist,
  removeFromWishlist,
  updatePreferences,
  getShareLink,
  ShareableProfile,
  WishlistItem,
} from '../lib/shareableProfile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SharedProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ personId?: string; code?: string }>();
  const [profile, setProfile] = useState<ShareableProfile | null>(null);
  const [presenteados, setPresenteados] = useState<Presenteado[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState(params.personId || '');
  const [showPersonPicker, setShowPersonPicker] = useState(!params.personId && !params.code);
  const [loading, setLoading] = useState(true);

  // Wishlist form
  const [showAddWishlist, setShowAddWishlist] = useState(false);
  const [wishName, setWishName] = useState('');
  const [wishLink, setWishLink] = useState('');
  const [wishPrice, setWishPrice] = useState('');
  const [wishPriority, setWishPriority] = useState<'alta' | 'media' | 'baixa'>('media');

  // Preferences form
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefsNotes, setPrefsNotes] = useState('');
  const [prefInterests, setPrefInterests] = useState('');
  const [prefDislikes, setPrefDislikes] = useState('');

  useFocusEffect(
    useCallback(() => {
      getPresenteados().then(setPresenteados).catch(() => {});
    }, [])
  );

  useEffect(() => {
    loadProfile();
  }, [selectedPersonId, params.code]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (params.code) {
        const p = await getProfileByCode(params.code);
        setProfile(p);
      } else if (selectedPersonId) {
        const p = await getProfileByPerson(selectedPersonId);
        setProfile(p);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!selectedPersonId) {
      Alert.alert('Erro', 'Selecione uma pessoa.');
      return;
    }
    const person = presenteados.find((p) => p.id === selectedPersonId);
    if (!person) return;

    const p = await createShareableProfile(person);
    setProfile(p);
    setShowPersonPicker(false);
  };

  const handleShare = async () => {
    if (!profile) return;
    const link = getShareLink(profile.shareCode);
    try {
      await Share.share({
        message: `Preencha suas preferencias de presente no ZIFT!\n\nCodigo: ${profile.shareCode}\n\n${link}`,
        title: 'ZIFT - Perfil de Presentes',
      });
    } catch {}
  };

  const handleAddWishlistItem = async () => {
    if (!profile || !wishName.trim()) {
      Alert.alert('Erro', 'Preencha o nome do item.');
      return;
    }

    const updated = await addToWishlist(profile.id, {
      name: wishName.trim(),
      link: wishLink.trim() || undefined,
      priceRange: wishPrice.trim() || undefined,
      priority: wishPriority,
    });

    if (updated) {
      setProfile(updated);
      setWishName('');
      setWishLink('');
      setWishPrice('');
      setShowAddWishlist(false);
    }
  };

  const handleRemoveWishlistItem = async (itemId: string) => {
    if (!profile) return;
    const updated = await removeFromWishlist(profile.id, itemId);
    if (updated) setProfile(updated);
  };

  const handleSavePrefs = async () => {
    if (!profile) return;
    const updated = await updatePreferences(profile.id, {
      interests: prefInterests ? prefInterests.split(',').map((s) => s.trim()) : undefined,
      dislikes: prefDislikes ? prefDislikes.split(',').map((s) => s.trim()) : undefined,
      notes: prefsNotes.trim() || undefined,
    });
    if (updated) {
      setProfile(updated);
      setShowPrefs(false);
      Alert.alert('Sucesso!', 'Preferencias salvas.');
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'alta': return { label: 'Alta', color: theme.colors.error };
      case 'media': return { label: 'Media', color: theme.colors.warning };
      case 'baixa': return { label: 'Baixa', color: theme.colors.success };
      default: return { label: 'Media', color: theme.colors.warning };
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil Compartilhavel</Text>
        {profile && (
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {!profile && <View style={{ width: 24 }} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Person picker */}
        {showPersonPicker && !params.code && (
          <View style={styles.pickerSection}>
            <Text style={styles.pickerTitle}>Criar perfil para quem?</Text>
            <Text style={styles.pickerSubtitle}>
              A pessoa podera preencher suas preferencias via link
            </Text>
            <View style={styles.personGrid}>
              {presenteados.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personCard, selectedPersonId === p.id && styles.personCardActive]}
                  onPress={() => setSelectedPersonId(p.id)}
                >
                  <View style={styles.personAvatar}>
                    <Ionicons
                      name="person"
                      size={20}
                      color={selectedPersonId === p.id ? '#fff' : theme.colors.primary}
                    />
                  </View>
                  <Text
                    style={[styles.personCardName, selectedPersonId === p.id && styles.personCardNameActive]}
                    numberOfLines={1}
                  >
                    {p.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateProfile}>
              <Text style={styles.createButtonText}>Criar Perfil</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Profile view */}
        {profile && (
          <>
            {/* Share code card */}
            <View style={styles.codeCard}>
              <View style={styles.codeCardTop}>
                <Ionicons name="link" size={20} color={theme.colors.primary} />
                <Text style={styles.codeCardLabel}>Codigo de compartilhamento</Text>
              </View>
              <Text style={styles.codeCardCode}>{profile.shareCode}</Text>
              <Text style={styles.codeCardHint}>
                Envie este codigo para {profile.personName} preencher suas preferencias
              </Text>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Ionicons name="share-social" size={18} color="#fff" />
                <Text style={styles.shareButtonText}>Compartilhar Link</Text>
              </TouchableOpacity>
            </View>

            {/* Wishlist */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Lista de Desejos</Text>
                <TouchableOpacity onPress={() => setShowAddWishlist(!showAddWishlist)}>
                  <Ionicons
                    name={showAddWishlist ? 'close-circle' : 'add-circle'}
                    size={24}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {showAddWishlist && (
                <View style={styles.wishForm}>
                  <TextInput
                    style={styles.wishInput}
                    placeholder="Nome do item desejado"
                    placeholderTextColor={theme.colors.roseGrey}
                    value={wishName}
                    onChangeText={setWishName}
                  />
                  <TextInput
                    style={styles.wishInput}
                    placeholder="Link (opcional)"
                    placeholderTextColor={theme.colors.roseGrey}
                    value={wishLink}
                    onChangeText={setWishLink}
                    autoCapitalize="none"
                  />
                  <View style={styles.wishFormRow}>
                    <TextInput
                      style={[styles.wishInput, { flex: 1 }]}
                      placeholder="Faixa de preco"
                      placeholderTextColor={theme.colors.roseGrey}
                      value={wishPrice}
                      onChangeText={setWishPrice}
                    />
                  </View>
                  <View style={styles.priorityRow}>
                    {(['alta', 'media', 'baixa'] as const).map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.priorityChip, wishPriority === p && { backgroundColor: getPriorityConfig(p).color, borderColor: getPriorityConfig(p).color }]}
                        onPress={() => setWishPriority(p)}
                      >
                        <Text style={[styles.priorityChipText, wishPriority === p && { color: '#fff' }]}>
                          {getPriorityConfig(p).label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.wishAddButton} onPress={handleAddWishlistItem}>
                    <Text style={styles.wishAddButtonText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {profile.wishlist.length === 0 ? (
                <View style={styles.emptyWishlist}>
                  <Ionicons name="star-outline" size={32} color={theme.colors.champagneBorder} />
                  <Text style={styles.emptyWishlistText}>Nenhum item na lista de desejos</Text>
                </View>
              ) : (
                profile.wishlist.map((item) => {
                  const prioConfig = getPriorityConfig(item.priority);
                  return (
                    <View key={item.id} style={styles.wishlistItem}>
                      <View style={styles.wishlistItemInfo}>
                        <Text style={styles.wishlistItemName}>{item.name}</Text>
                        <View style={styles.wishlistItemMeta}>
                          <View style={[styles.prioBadge, { backgroundColor: `${prioConfig.color}20` }]}>
                            <Text style={[styles.prioBadgeText, { color: prioConfig.color }]}>
                              {prioConfig.label}
                            </Text>
                          </View>
                          {item.priceRange && (
                            <Text style={styles.wishlistItemPrice}>{item.priceRange}</Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveWishlistItem(item.id)}>
                        <Ionicons name="close-circle-outline" size={20} color={theme.colors.roseGrey} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>

            {/* Preferences */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Preferencias</Text>
                <TouchableOpacity onPress={() => {
                  setShowPrefs(!showPrefs);
                  if (!showPrefs && profile.preferences) {
                    setPrefsNotes(profile.preferences.notes || '');
                    setPrefInterests(profile.preferences.interests?.join(', ') || '');
                    setPrefDislikes(profile.preferences.dislikes?.join(', ') || '');
                  }
                }}>
                  <Ionicons
                    name={showPrefs ? 'close-circle' : 'create'}
                    size={22}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {showPrefs ? (
                <View style={styles.prefsForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Interesses (separar por virgula)</Text>
                    <TextInput
                      style={styles.wishInput}
                      placeholder="Ex: tecnologia, viagem, musica"
                      placeholderTextColor={theme.colors.roseGrey}
                      value={prefInterests}
                      onChangeText={setPrefInterests}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Nao gosta de (separar por virgula)</Text>
                    <TextInput
                      style={styles.wishInput}
                      placeholder="Ex: bichos de pelucia, doces"
                      placeholderTextColor={theme.colors.roseGrey}
                      value={prefDislikes}
                      onChangeText={setPrefDislikes}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Observacoes</Text>
                    <TextInput
                      style={[styles.wishInput, { height: 60 }]}
                      placeholder="Outras preferencias..."
                      placeholderTextColor={theme.colors.roseGrey}
                      value={prefsNotes}
                      onChangeText={setPrefsNotes}
                      multiline
                    />
                  </View>
                  <TouchableOpacity style={styles.wishAddButton} onPress={handleSavePrefs}>
                    <Text style={styles.wishAddButtonText}>Salvar Preferencias</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.prefsDisplay}>
                  {profile.preferences.interests && profile.preferences.interests.length > 0 && (
                    <View style={styles.prefRow}>
                      <Ionicons name="heart" size={14} color={theme.colors.success} />
                      <Text style={styles.prefText}>Gosta: {profile.preferences.interests.join(', ')}</Text>
                    </View>
                  )}
                  {profile.preferences.dislikes && profile.preferences.dislikes.length > 0 && (
                    <View style={styles.prefRow}>
                      <Ionicons name="close-circle" size={14} color={theme.colors.error} />
                      <Text style={styles.prefText}>Nao gosta: {profile.preferences.dislikes.join(', ')}</Text>
                    </View>
                  )}
                  {profile.preferences.notes && (
                    <View style={styles.prefRow}>
                      <Ionicons name="document-text" size={14} color={theme.colors.roseGrey} />
                      <Text style={styles.prefText}>{profile.preferences.notes}</Text>
                    </View>
                  )}
                  {!profile.preferences.interests?.length && !profile.preferences.dislikes?.length && !profile.preferences.notes && (
                    <Text style={styles.noPrefText}>Nenhuma preferencia preenchida ainda</Text>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: 48,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textMain, flex: 1, textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  // Picker
  pickerSection: { alignItems: 'center', paddingVertical: 24 },
  pickerTitle: { fontSize: 22, fontWeight: '500', color: theme.colors.textMain, marginBottom: 8 },
  pickerSubtitle: { fontSize: 14, color: theme.colors.roseGrey, textAlign: 'center', marginBottom: 24 },
  personGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 },
  personCard: {
    width: 90, alignItems: 'center', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: theme.colors.champagneBorder, backgroundColor: theme.colors.surfaceLight,
  },
  personCardActive: { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` },
  personAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  personCardName: { fontSize: 13, fontWeight: '500', color: theme.colors.textMain },
  personCardNameActive: { color: theme.colors.primary },
  createButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.primary,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
  },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  // Code card
  codeCard: {
    backgroundColor: theme.colors.surfaceLight, borderRadius: 16, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: theme.colors.champagneBorder, marginBottom: 16,
  },
  codeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  codeCardLabel: { fontSize: 13, fontWeight: '500', color: theme.colors.roseGrey },
  codeCardCode: {
    fontSize: 36, fontWeight: '800', color: theme.colors.primary, letterSpacing: 6, marginBottom: 8,
  },
  codeCardHint: { fontSize: 13, color: theme.colors.roseGrey, textAlign: 'center', marginBottom: 16 },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.primary,
    borderRadius: 999, paddingVertical: 12, paddingHorizontal: 24,
  },
  shareButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  // Section
  section: {
    backgroundColor: theme.colors.surfaceLight, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: theme.colors.champagneBorder, marginBottom: 16,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: theme.colors.textMain },
  // Wishlist
  wishForm: { gap: 10, marginBottom: 16 },
  wishInput: {
    backgroundColor: theme.colors.backgroundLight, borderWidth: 1, borderColor: theme.colors.champagneBorder,
    borderRadius: 10, paddingHorizontal: 14, height: 44, fontSize: 15, color: theme.colors.textMain,
  },
  wishFormRow: { flexDirection: 'row', gap: 10 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityChip: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: theme.colors.champagneBorder,
  },
  priorityChipText: { fontSize: 13, fontWeight: '500', color: theme.colors.textMuted },
  wishAddButton: {
    backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  wishAddButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  emptyWishlist: { alignItems: 'center', paddingVertical: 24 },
  emptyWishlistText: { fontSize: 13, color: theme.colors.roseGrey, marginTop: 8 },
  wishlistItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.champagneBorder,
  },
  wishlistItemInfo: { flex: 1, marginRight: 12 },
  wishlistItemName: { fontSize: 15, fontWeight: '500', color: theme.colors.textMain },
  wishlistItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  prioBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  prioBadgeText: { fontSize: 10, fontWeight: '600' },
  wishlistItemPrice: { fontSize: 12, color: theme.colors.roseGrey },
  // Preferences
  prefsForm: { gap: 12 },
  formGroup: { gap: 4 },
  formLabel: { fontSize: 13, fontWeight: '500', color: theme.colors.textMuted },
  prefsDisplay: { gap: 8 },
  prefRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  prefText: { fontSize: 14, color: theme.colors.textMain, flex: 1 },
  noPrefText: { fontSize: 13, color: theme.colors.roseGrey, fontStyle: 'italic' },
});
