import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  getGiftHistory,
  saveGiftRecord,
  updateGiftRecord,
  deleteGiftRecord,
  GiftRecord,
} from '../lib/giftHistory';
import { getPresenteados, Presenteado } from '../lib/presenteados';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GiftHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [presenteados, setPresenteados] = useState<Presenteado[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterPersonId, setFilterPersonId] = useState<string>('');

  // Form state
  const [giftName, setGiftName] = useState('');
  const [giftPrice, setGiftPrice] = useState('');
  const [giftDate, setGiftDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [giftOccasion, setGiftOccasion] = useState('');
  const [giftPersonId, setGiftPersonId] = useState('');
  const [giftNotes, setGiftNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([getGiftHistory(), getPresenteados()])
        .then(([h, p]) => {
          if (isActive) {
            setGifts(h);
            setPresenteados(p);
          }
        })
        .catch(() => {});
      return () => { isActive = false; };
    }, [])
  );

  const filteredGifts = filterPersonId
    ? gifts.filter((g) => g.personId === filterPersonId)
    : gifts;

  const formatDate = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setGiftDate(selectedDate);
  };

  const resetForm = () => {
    setGiftName('');
    setGiftPrice('');
    setGiftDate(null);
    setGiftOccasion('');
    setGiftPersonId('');
    setGiftNotes('');
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!giftName.trim()) {
      Alert.alert('Erro', 'Preencha o nome do presente.');
      return;
    }
    if (!giftPersonId) {
      Alert.alert('Erro', 'Selecione uma pessoa.');
      return;
    }

    try {
      setIsSaving(true);
      const person = presenteados.find((p) => p.id === giftPersonId);
      const newGifts = await saveGiftRecord({
        id: String(Date.now()),
        personId: giftPersonId,
        personName: person?.name || '',
        giftName: giftName.trim(),
        price: giftPrice ? parseFloat(giftPrice.replace(',', '.')) : undefined,
        date: giftDate ? formatDate(giftDate) : formatDate(new Date()),
        occasion: giftOccasion || undefined,
        notes: giftNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
      setGifts(newGifts);
      resetForm();
      Alert.alert('Sucesso!', 'Presente registrado no historico.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLiked = async (gift: GiftRecord) => {
    const newLiked = gift.liked === true ? false : true;
    const updated = await updateGiftRecord(gift.id, { liked: newLiked });
    setGifts(updated);
  };

  const handleDelete = (gift: GiftRecord) => {
    Alert.alert(
      'Remover presente',
      `Remover "${gift.giftName}" do historico?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteGiftRecord(gift.id);
            setGifts(updated);
          },
        },
      ]
    );
  };

  const totalSpent = filteredGifts.reduce((sum, g) => sum + (g.price || 0), 0);
  const occasions = ['Aniversario', 'Natal', 'Namoro', 'Casamento', 'Dia das Maes', 'Dia dos Pais', 'Outro'];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historico de Presentes</Text>
        <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
          <Ionicons
            name={showAddForm ? 'close' : 'add-circle'}
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{filteredGifts.length}</Text>
            <Text style={styles.statLabel}>Presentes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </Text>
            <Text style={styles.statLabel}>Total gasto</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {filteredGifts.filter((g) => g.liked === true).length}
            </Text>
            <Text style={styles.statLabel}>Aprovados</Text>
          </View>
        </View>

        {/* Filter by person */}
        {presenteados.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[styles.filterChip, !filterPersonId && styles.filterChipActive]}
              onPress={() => setFilterPersonId('')}
            >
              <Text style={[styles.filterChipText, !filterPersonId && styles.filterChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {presenteados.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.filterChip, filterPersonId === p.id && styles.filterChipActive]}
                onPress={() => setFilterPersonId(filterPersonId === p.id ? '' : p.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterPersonId === p.id && styles.filterChipTextActive,
                  ]}
                >
                  {p.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Registrar Presente</Text>

            {/* Person selector */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Para quem?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personChips}>
                {presenteados.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.personChip, giftPersonId === p.id && styles.personChipActive]}
                    onPress={() => setGiftPersonId(p.id)}
                  >
                    <Ionicons
                      name="person"
                      size={14}
                      color={giftPersonId === p.id ? '#fff' : theme.colors.roseGrey}
                    />
                    <Text
                      style={[styles.personChipText, giftPersonId === p.id && styles.personChipTextActive]}
                    >
                      {p.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Presente</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Perfume Channel No 5"
                placeholderTextColor={theme.colors.roseGrey}
                value={giftName}
                onChangeText={setGiftName}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Valor (R$)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="150,00"
                  placeholderTextColor={theme.colors.roseGrey}
                  value={giftPrice}
                  onChangeText={setGiftPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Data</Text>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={giftDate ? styles.formInputText : styles.formPlaceholder}>
                    {giftDate ? formatDate(giftDate) : 'Selecionar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <View>
                <DateTimePicker
                  value={giftDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  locale="pt-BR"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.datePickerDone} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerDoneText}>Confirmar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ocasiao</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personChips}>
                {occasions.map((o) => (
                  <TouchableOpacity
                    key={o}
                    style={[styles.personChip, giftOccasion === o && styles.personChipActive]}
                    onPress={() => setGiftOccasion(giftOccasion === o ? '' : o)}
                  >
                    <Text style={[styles.personChipText, giftOccasion === o && styles.personChipTextActive]}>
                      {o}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notas (opcional)</Text>
              <TextInput
                style={[styles.formInput, { height: 60 }]}
                placeholder="Observacoes..."
                placeholderTextColor={theme.colors.roseGrey}
                value={giftNotes}
                onChangeText={setGiftNotes}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Salvando...' : 'Registrar Presente'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gift List */}
        {filteredGifts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={48} color={theme.colors.champagneBorder} />
            <Text style={styles.emptyTitle}>Nenhum presente registrado</Text>
            <Text style={styles.emptySubtitle}>
              Registre presentes dados para nao repetir e aprender o que funciona
            </Text>
          </View>
        ) : (
          filteredGifts.map((gift) => (
            <View key={gift.id} style={styles.giftCard}>
              <View style={styles.giftCardHeader}>
                <View style={styles.giftCardInfo}>
                  <Text style={styles.giftCardName}>{gift.giftName}</Text>
                  <View style={styles.giftCardMeta}>
                    <Ionicons name="person" size={12} color={theme.colors.roseGrey} />
                    <Text style={styles.giftCardPerson}>{gift.personName}</Text>
                    {gift.occasion && (
                      <Text style={styles.giftCardOccasion}>{gift.occasion}</Text>
                    )}
                  </View>
                </View>
                {gift.price && (
                  <Text style={styles.giftCardPrice}>
                    R$ {gift.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </Text>
                )}
              </View>

              <View style={styles.giftCardFooter}>
                <Text style={styles.giftCardDate}>{gift.date}</Text>
                <View style={styles.giftCardActions}>
                  <TouchableOpacity
                    style={[
                      styles.likeButton,
                      gift.liked === true && styles.likeButtonActive,
                    ]}
                    onPress={() => handleToggleLiked(gift)}
                  >
                    <Ionicons
                      name={gift.liked ? 'heart' : 'heart-outline'}
                      size={16}
                      color={gift.liked ? theme.colors.error : theme.colors.roseGrey}
                    />
                    <Text
                      style={[
                        styles.likeButtonText,
                        gift.liked && styles.likeButtonTextActive,
                      ]}
                    >
                      {gift.liked ? 'Gostou' : 'Gostou?'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(gift)}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.roseGrey} />
                  </TouchableOpacity>
                </View>
              </View>
              {gift.notes && <Text style={styles.giftCardNotes}>{gift.notes}</Text>}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textMain, flex: 1, textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  statNumber: { fontSize: 20, fontWeight: '700', color: theme.colors.textMain },
  statLabel: { fontSize: 11, color: theme.colors.roseGrey, marginTop: 2 },
  // Filter
  filterRow: { gap: 8, marginBottom: 16, paddingVertical: 4 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    backgroundColor: theme.colors.surfaceLight,
  },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '500', color: theme.colors.textMuted },
  filterChipTextActive: { color: '#fff' },
  // Add form
  addForm: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    gap: 16,
  },
  formTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textMain },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: '500', color: theme.colors.textMuted },
  formInput: {
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 15,
    color: theme.colors.textMain,
    justifyContent: 'center',
  },
  formInputText: { fontSize: 15, color: theme.colors.textMain },
  formPlaceholder: { fontSize: 15, color: theme.colors.roseGrey },
  formRow: { flexDirection: 'row', gap: 12 },
  personChips: { gap: 8, paddingVertical: 2 },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  personChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  personChipText: { fontSize: 13, fontWeight: '500', color: theme.colors.textMuted },
  personChipTextActive: { color: '#fff' },
  datePickerDone: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    marginTop: 8,
  },
  datePickerDoneText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '500', color: theme.colors.textMuted, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: theme.colors.roseGrey, marginTop: 4, textAlign: 'center' },
  // Gift cards
  giftCard: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  giftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  giftCardInfo: { flex: 1, marginRight: 12 },
  giftCardName: { fontSize: 15, fontWeight: '600', color: theme.colors.textMain },
  giftCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  giftCardPerson: { fontSize: 12, color: theme.colors.roseGrey },
  giftCardOccasion: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
    overflow: 'hidden',
  },
  giftCardPrice: { fontSize: 15, fontWeight: '700', color: theme.colors.textMain },
  giftCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.champagneBorder,
  },
  giftCardDate: { fontSize: 12, color: theme.colors.roseGrey },
  giftCardActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  likeButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeButtonActive: {},
  likeButtonText: { fontSize: 12, color: theme.colors.roseGrey },
  likeButtonTextActive: { color: theme.colors.error },
  giftCardNotes: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.champagneBorder,
  },
});
