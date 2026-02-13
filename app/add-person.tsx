import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { savePresenteado, updatePresenteado } from '../lib/presenteados';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LifestyleOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const SHIRT_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
const PANTS_SIZES = ['34', '36', '38', '40', '42', '44', '46', '48'];

export default function AddPersonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    editId?: string;
    editName?: string;
    editBirthday?: string;
    editRelationship?: string;
    editPhotoUri?: string;
    editShoeSize?: string;
    editShirtSize?: string;
    editPantsSize?: string;
    editDressSize?: string;
    editRingSize?: string;
    editObservations?: string;
    editLifestyles?: string;
  }>();

  const isEditMode = !!params.editId;
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [relationship, setRelationship] = useState('');
  const [lifestyles, setLifestyles] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [observations, setObservations] = useState('');

  // Campos de vestuário (opcionais)
  const [showClothingSection, setShowClothingSection] = useState(false);
  const [shoeSize, setShoeSize] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [pantsSize, setPantsSize] = useState('');
  const [dressSize, setDressSize] = useState('');
  const [ringSize, setRingSize] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setName(params.editName || '');
      setRelationship(params.editRelationship || '');
      setPhotoUri(params.editPhotoUri || null);
      setShoeSize(params.editShoeSize || '');
      setShirtSize(params.editShirtSize || '');
      setPantsSize(params.editPantsSize || '');
      setDressSize(params.editDressSize || '');
      setRingSize(params.editRingSize || '');
      setObservations(params.editObservations || '');
      if (params.editLifestyles) {
        try { setLifestyles(JSON.parse(params.editLifestyles)); } catch { /* ignore */ }
      }
      if (params.editBirthday) {
        const parts = params.editBirthday.split('/');
        if (parts.length === 3) {
          const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          if (!isNaN(d.getTime())) setBirthday(d);
        }
      }
      if (params.editShoeSize || params.editShirtSize || params.editPantsSize || params.editDressSize || params.editRingSize) {
        setShowClothingSection(true);
      }
    }
  }, []);

  const relationships = ['Cônjuge', 'Pai/Mãe', 'Amigo', 'Parceiro', 'Colega'];

  const lifestyleOptions: LifestyleOption[] = [
    { id: 'viagem', icon: 'airplane', label: 'Viagem' },
    { id: 'gourmet', icon: 'restaurant', label: 'Gourmet' },
    { id: 'arte', icon: 'color-palette', label: 'Arte' },
    { id: 'moda', icon: 'shirt', label: 'Moda' },
    { id: 'tech', icon: 'phone-portrait', label: 'Tech' },
    { id: 'bem-estar', icon: 'leaf', label: 'Bem-estar' },
  ];

  const handlePickPhoto = () => {
    Alert.alert(
      'Selecionar Foto',
      'Escolha uma opção',
      [
        { text: 'Tirar Foto', onPress: handleTakePhoto },
        { text: 'Escolher da Galeria', onPress: handleChooseFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    try {
      setIsPicking(true);
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraStatus.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar uma foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      setIsPicking(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a foto.');
    } finally {
      setIsPicking(false);
    }
  };

  const toggleLifestyle = (id: string) => {
    if (lifestyles.includes(id)) {
      setLifestyles(lifestyles.filter(l => l !== id));
    } else if (lifestyles.length < 3) {
      setLifestyles([...lifestyles, id]);
    } else {
      Alert.alert('Limite atingido', 'Você pode selecionar no máximo 3 estilos de vida.');
    }
  };

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
      setBirthday(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome.');
      return;
    }

    try {
      setIsSaving(true);

      const personData = {
        name: name.trim(),
        birthday: birthday ? formatDate(birthday) : undefined,
        relationship: relationship || undefined,
        photoUri: photoUri || undefined,
        shoeSize: shoeSize || undefined,
        shirtSize: shirtSize || undefined,
        pantsSize: pantsSize || undefined,
        dressSize: dressSize || undefined,
        ringSize: ringSize || undefined,
        observations: observations.trim() || undefined,
        lifestyles: lifestyles.length > 0 ? lifestyles : undefined,
      };

      if (isEditMode && params.editId) {
        await updatePresenteado(params.editId, personData);
        Alert.alert(
          'Atualizado!',
          `Perfil de ${name} foi atualizado.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        await savePresenteado({
          ...personData,
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
        });
        Alert.alert(
          'Sucesso!',
          `${name} foi salvo(a) como pessoa especial.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/presenteados')}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Editar Perfil' : 'Adicionar Pessoa Especial'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.headlineTitle}>{isEditMode ? 'Atualize o perfil' : 'Quem vamos celebrar?'}</Text>
          <Text style={styles.headlineSubtitle}>
            {isEditMode ? 'Quanto mais detalhes, melhores as sugestões.' : 'Crie um perfil para curadoria personalizada.'}
          </Text>
        </View>

        {/* Avatar Upload */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickPhoto}
            disabled={isPicking}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="camera" size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.avatarAddButton}>
                  <Ionicons name="add" size={14} color="#fff" />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Isabella Meneghel"
                placeholderTextColor={theme.colors.roseGrey}
                value={name}
                onChangeText={setName}
              />
              <Ionicons name="create-outline" size={20} color={theme.colors.roseGrey} />
            </View>
          </View>

          {/* Relationship Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vínculo</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {relationships.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.chip,
                    relationship === rel && styles.chipActive,
                  ]}
                  onPress={() => setRelationship(rel)}
                >
                  <Text style={[
                    styles.chipText,
                    relationship === rel && styles.chipTextActive,
                  ]}>
                    {rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Birthday Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Data de Nascimento</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !birthday && styles.placeholderText]}>
                {birthday ? formatDate(birthday) : 'Selecionar data'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.roseGrey} />
            </TouchableOpacity>

            {showDatePicker && (
              <View>
                <DateTimePicker
                  value={birthday || new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
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

          {/* Lifestyle Grid */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Estilo de Vida</Text>
              <Text style={styles.labelHint}>Selecione até 3</Text>
            </View>
            <View style={styles.lifestyleGrid}>
              {lifestyleOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.lifestyleCard,
                    lifestyles.includes(option.id) && styles.lifestyleCardActive,
                  ]}
                  onPress={() => toggleLifestyle(option.id)}
                >
                  {lifestyles.includes(option.id) && (
                    <View style={styles.lifestyleIndicator} />
                  )}
                  <Ionicons
                    name={option.icon}
                    size={28}
                    color={lifestyles.includes(option.id) ? theme.colors.primary : theme.colors.roseGrey}
                  />
                  <Text style={[
                    styles.lifestyleLabel,
                    lifestyles.includes(option.id) && styles.lifestyleLabelActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Clothing / Sizes Section (Optional) */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.sectionToggle}
              onPress={() => setShowClothingSection(!showClothingSection)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionToggleLeft}>
                <Ionicons name="shirt-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.inputLabel}>Medidas e Tamanhos</Text>
              </View>
              <View style={styles.sectionToggleRight}>
                <Text style={styles.optionalTag}>Opcional</Text>
                <Ionicons
                  name={showClothingSection ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.roseGrey}
                />
              </View>
            </TouchableOpacity>

            {showClothingSection && (
              <View style={styles.clothingSection}>
                {/* Shoe Size */}
                <View style={styles.clothingRow}>
                  <View style={styles.clothingLabelRow}>
                    <Ionicons name="footsteps-outline" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.clothingLabel}>Calçado</Text>
                  </View>
                  <View style={styles.inputContainerSmall}>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="Ex: 42"
                      placeholderTextColor={theme.colors.roseGrey}
                      value={shoeSize}
                      onChangeText={setShoeSize}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Shirt Size */}
                <View style={styles.clothingRow}>
                  <View style={styles.clothingLabelRow}>
                    <Ionicons name="shirt-outline" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.clothingLabel}>Camiseta</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sizeChipsContainer}
                  >
                    {SHIRT_SIZES.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[styles.sizeChip, shirtSize === size && styles.sizeChipActive]}
                        onPress={() => setShirtSize(shirtSize === size ? '' : size)}
                      >
                        <Text style={[styles.sizeChipText, shirtSize === size && styles.sizeChipTextActive]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Pants Size */}
                <View style={styles.clothingRow}>
                  <View style={styles.clothingLabelRow}>
                    <Ionicons name="body-outline" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.clothingLabel}>Calça</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sizeChipsContainer}
                  >
                    {PANTS_SIZES.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[styles.sizeChip, pantsSize === size && styles.sizeChipActive]}
                        onPress={() => setPantsSize(pantsSize === size ? '' : size)}
                      >
                        <Text style={[styles.sizeChipText, pantsSize === size && styles.sizeChipTextActive]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Dress Size */}
                <View style={styles.clothingRow}>
                  <View style={styles.clothingLabelRow}>
                    <Ionicons name="rose-outline" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.clothingLabel}>Roupa</Text>
                  </View>
                  <View style={styles.inputContainerSmall}>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="Ex: M ou 40"
                      placeholderTextColor={theme.colors.roseGrey}
                      value={dressSize}
                      onChangeText={setDressSize}
                    />
                  </View>
                </View>

                {/* Ring Size */}
                <View style={styles.clothingRow}>
                  <View style={styles.clothingLabelRow}>
                    <Ionicons name="diamond-outline" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.clothingLabel}>Anel</Text>
                  </View>
                  <View style={styles.inputContainerSmall}>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="Ex: 18"
                      placeholderTextColor={theme.colors.roseGrey}
                      value={ringSize}
                      onChangeText={setRingSize}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Observations */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Observações</Text>
              <Text style={styles.labelHint}>Opcional</Text>
            </View>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Ex: Adora café, prefere cores neutras, não gosta de bijuterias..."
                placeholderTextColor={theme.colors.roseGrey}
                value={observations}
                onChangeText={setObservations}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Save Button */}
      <View style={[styles.footerGradient, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Salvando...' : isEditMode ? 'Atualizar Perfil' : 'Salvar Perfil'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: `${theme.colors.primary}80`,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarAddButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.backgroundLight,
  },
  form: {
    gap: 32,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  labelHint: {
    fontSize: 12,
    color: theme.colors.roseGrey,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.roseGrey,
  },
  chipTextActive: {
    color: '#fff',
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lifestyleCard: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    backgroundColor: theme.colors.surfaceLight,
    gap: 8,
    position: 'relative',
  },
  lifestyleCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  lifestyleIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  lifestyleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textMain,
  },
  lifestyleLabelActive: {
    color: theme.colors.primary,
  },

  // Clothing section
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionalTag: {
    fontSize: 11,
    color: theme.colors.roseGrey,
    fontWeight: '500',
    backgroundColor: theme.colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  clothingSection: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    padding: 16,
    gap: 20,
  },
  clothingRow: {
    gap: 8,
  },
  clothingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clothingLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  inputContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
  },
  inputSmall: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textMain,
  },
  sizeChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    backgroundColor: theme.colors.backgroundLight,
  },
  sizeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sizeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  sizeChipTextActive: {
    color: '#fff',
  },

  textAreaContainer: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 15,
    color: theme.colors.textMain,
    minHeight: 80,
    lineHeight: 22,
  },
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
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
