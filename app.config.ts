import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ZIFT',
  slug: 'zift-app',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'zift',
  splash: {
    image: './assets/splash.jpg',
    backgroundColor: '#1A1814',
    resizeMode: 'contain',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.zift.app',
    infoPlist: {
      NSCameraUsageDescription:
        'O ZIFT precisa acessar sua câmera para tirar fotos dos presenteados.',
      NSPhotoLibraryUsageDescription:
        'O ZIFT precisa acessar suas fotos para selecionar imagens dos presenteados.',
    },
},
  android: {
    adaptiveIcon: {
      backgroundColor: '#1A1814',
    },
    package: 'com.zift.app',
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'VIBRATE',
    ],
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-image-picker',
      {
        photosPermission:
          'O ZIFT precisa acessar suas fotos para selecionar imagens dos presenteados.',
        cameraPermission:
          'O ZIFT precisa acessar sua câmera para tirar fotos dos presenteados.',
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-video',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    eas: {
      projectId: '1cc3b866-3206-4d01-ab37-3bb06abd7095',
    },
  },
});
