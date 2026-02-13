import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PersonalDataScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('Isabella Vilanova');
  const [email, setEmail] = useState('isabella.vilanova@client.com');
  const [phone, setPhone] = useState('(11) 99876-5432');
  const [cpf, setCpf] = useState('123.456.789-00');
  const [address, setAddress] = useState('Av. Europa, 1285 - Jardins, São Paulo - SP');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simula salvamento
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Sucesso!',
        'Seus dados foram atualizados.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.roseGrey} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dados Pessoais</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form */}
        <View style={styles.form}>
          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="person-outline" size={22} color={theme.colors.roseGrey} />
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome completo"
                placeholderTextColor={theme.colors.roseGrey}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-mail</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={22} color={theme.colors.roseGrey} />
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={theme.colors.roseGrey}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Telefone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefone</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="call-outline" size={22} color={theme.colors.roseGrey} />
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="(00) 00000-0000"
                placeholderTextColor={theme.colors.roseGrey}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* CPF */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CPF</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="card-outline" size={22} color={theme.colors.roseGrey} />
              </View>
              <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={setCpf}
                placeholder="000.000.000-00"
                placeholderTextColor={theme.colors.roseGrey}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Endereço */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Endereço Principal</Text>
            <View style={[styles.inputContainer, styles.textareaContainer]}>
              <View style={[styles.inputIcon, styles.textareaIcon]}>
                <Ionicons name="home-outline" size={22} color={theme.colors.roseGrey} />
              </View>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Rua, Número, Complemento, Bairro - Cidade/UF"
                placeholderTextColor={theme.colors.roseGrey}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f4c025', '#ffeaa7', '#d4a015']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveGradient}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Text>
            <Ionicons name="checkmark" size={20} color={theme.colors.backgroundDark} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.privacyNote}>
          Suas informações estão protegidas pela nossa política de privacidade.
        </Text>
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
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: `${theme.colors.backgroundLight}F2`,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textMain,
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
    paddingBottom: 200,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textMain,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textMain,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  textareaContainer: {
    alignItems: 'flex-start',
  },
  textareaIcon: {
    paddingTop: 14,
  },
  textarea: {
    minHeight: 100,
    paddingTop: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: theme.colors.backgroundLight,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.backgroundDark,
  },
  privacyNote: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    textAlign: 'center',
    marginTop: 16,
  },
});

