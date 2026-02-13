import { useEffect, useState, useRef } from 'react';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEEP_LINK_FLAG = '@zift:opened_via_deeplink';
const DEEP_LINK_PATH = '@zift:deeplink_path';

export default function Index() {
  const [shouldShowLogin, setShouldShowLogin] = useState<boolean | null>(null);
  const [shouldShowSplash, setShouldShowSplash] = useState<boolean | null>(null);
  const [redirectPath, setRedirectPath] = useState<string>('/calendar');
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkDeepLink = async () => {
      try {
        // Verifica se há flag de deep link no AsyncStorage
        const deepLinkFlag = await AsyncStorage.getItem(DEEP_LINK_FLAG);
        const savedPath = await AsyncStorage.getItem(DEEP_LINK_PATH);

        if (deepLinkFlag === 'true') {
          // Foi aberto via deep link, mostra login (sem splash)
          await AsyncStorage.removeItem(DEEP_LINK_FLAG);
          if (savedPath) {
            await AsyncStorage.removeItem(DEEP_LINK_PATH);
            setRedirectPath(savedPath);
          }
          setShouldShowSplash(false);
          setShouldShowLogin(true);
          return;
        }

        // Verifica se o app foi aberto via deep link (QRCode)
        const initialUrl = await Linking.getInitialURL();

        // Verifica diferentes formatos de deep link
        const isDeepLink = initialUrl && (
          initialUrl.includes('zift://') ||
          initialUrl.includes('exp+zift-app://') ||
          (initialUrl.includes('http://') && !initialUrl.includes('localhost')) ||
          (initialUrl.includes('https://') && !initialUrl.includes('localhost'))
        );

        if (isDeepLink) {
          // Extrai o caminho do deep link
          const url = Linking.parse(initialUrl);
          let path = url.path || '/calendar';

          if (path.includes('?')) {
            path = path.split('?')[0];
          }

          if (!path.startsWith('/')) {
            path = '/' + path;
          }

          await AsyncStorage.setItem(DEEP_LINK_FLAG, 'true');
          await AsyncStorage.setItem(DEEP_LINK_PATH, path);

          setRedirectPath(path);
          setShouldShowSplash(false);
          setShouldShowLogin(true);
          return;
        }

        // Abertura normal do app - SEMPRE mostra splash primeiro
        setShouldShowSplash(true);
        setShouldShowLogin(false);

      } catch (error) {
        console.error('Erro ao verificar deep link:', error);
        // Em caso de erro, mostra splash mesmo assim
        setShouldShowSplash(true);
        setShouldShowLogin(false);
      }
    };

    checkDeepLink();
  }, []);

  if (shouldShowSplash === null && shouldShowLogin === null) {
    return null; // Loading
  }

  // Abertura normal - mostra splash com vídeo primeiro
  if (shouldShowSplash) {
    return <Redirect href="/splash" />;
  }

  // Se foi aberto via deep link (QRCode), vai para login
  if (shouldShowLogin) {
    return <Redirect href={`/login?redirect=${encodeURIComponent(redirectPath)}`} />;
  }

  // Fallback - vai para calendar
  return <Redirect href="/calendar" />;
}


