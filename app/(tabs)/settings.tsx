import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const theme = useColorScheme() ?? 'light';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: '#D0D0D0',
        dark: '#353636',
      }}
      headerImage={
        <IconSymbol
          size={300}
          color={Colors[theme].icon}
          name="gearshape.fill"
          style={styles.headerIcon}
        />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">General</ThemedText>
        <ThemedText>- Temperature Units (feature coming soon)</ThemedText>
        <ThemedText>- Theme Switch (coming soon)</ThemedText>
        <ThemedText>- Language (coming soon)</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Permissions</ThemedText>
        <ThemedText>- Location Access (coming soon)</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText>Weather Wiz App</ThemedText>
        <ThemedText>Version 1.0.0</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    position: 'absolute',
    bottom: -60,
    left: -20,
  },
  section: {
    marginBottom: 20,
    gap: 8,
  },
});
