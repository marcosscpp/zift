import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

let videoSource: any = null;
try {
  videoSource = require('../public/video-abertura.mp4');
} catch {
  console.log('Video local nao encontrado, usando fallback');
}

export default function SplashScreen() {
  const router = useRouter();
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.play();
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isVideoFinished) {
        navigateToApp();
      }
    }, 5000);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearTimeout(timeout);
  }, [isVideoFinished]);

  useEffect(() => {
    if (!player || !videoSource) return;

    const subscription = player.addListener('statusChange', (payload) => {
      if (payload.status === 'idle' && !payload.error) {
        // Video ended
        navigateToApp();
      }
      if (payload.error) {
        setVideoError(true);
        setTimeout(navigateToApp, 3000);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  const navigateToApp = () => {
    setIsVideoFinished(true);
    router.replace('/calendar');
  };

  if (videoSource && !videoError && player) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.backgroundGradient} />

      {[...Array(12)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: `${15 + (i * 7) % 70}%`,
              top: `${20 + (i * 11) % 60}%`,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.6],
              }),
              transform: [
                {
                  translateY: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20 - (i % 3) * 10],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoGlow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        />

        <View style={styles.giftBox}>
          <View style={styles.giftLid}>
            <View style={styles.giftBow} />
          </View>
          <View style={styles.giftBody}>
            <Text style={styles.logoZ}>Z</Text>
          </View>
          <View style={styles.giftRibbon} />
        </View>

        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          ZIFT
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0, 1],
              }),
            },
          ]}
        >
          Presentes que pensam por voce
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.backgroundDark,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
  },
  giftBox: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
  },
  giftLid: {
    width: 90,
    height: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
    zIndex: 2,
    alignItems: 'center',
  },
  giftBow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryDark,
    position: 'absolute',
    top: -12,
  },
  giftBody: {
    width: 80,
    height: 70,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftRibbon: {
    position: 'absolute',
    width: 12,
    height: 70,
    backgroundColor: theme.colors.primaryDark,
    bottom: 0,
    borderRadius: 4,
  },
  logoZ: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  appName: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 16,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.roseGrey,
    letterSpacing: 2,
  },
});
