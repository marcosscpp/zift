import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Destino após login (vem do deep link ou padrão para calendar)
  const getRedirectPath = () => {
    const redirect = params.redirect;
    if (Array.isArray(redirect)) {
      return redirect[0] || '/calendar';
    }
    return (redirect as string) || '/calendar';
  };

  const handleLogin = () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    
    // Login fictício - apenas redireciona
    // Em uma implementação real, aqui faria a verificação de credenciais
    const redirectTo = getRedirectPath();
    
    console.log('🔐 Fazendo login, redirecionando para:', redirectTo);
    
    // Garante que o caminho começa com /
    const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
    
    // Usa push diretamente (como no BottomNav)
    router.push(path);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="gift" size={64} color={theme.colors.primary} />
          <Text style={styles.logoText}>Zift</Text>
          <Text style={styles.subtitle}>Entre para continuar</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.roseGrey} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={theme.colors.roseGrey}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.roseGrey} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={theme.colors.roseGrey}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={theme.colors.roseGrey} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            <Text style={styles.loginButtonText}>
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Esta é uma tela de demonstração. Qualquer credencial será aceita.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 2,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.textMain,
    marginTop: theme.spacing.md,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.roseGrey,
    marginTop: theme.spacing.sm,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textMain,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.roseGrey,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
});

