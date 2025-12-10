import React, { ReactNode } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings, ThemeName } from '../context/SettingsContext';

type Props = { children: ReactNode };

export default function AppShell({ children }: Props) {
  const { theme } = useSettings();
  const { pageColors, appColors } = getThemeGradients(theme);

  return (
    <LinearGradient colors={pageColors} style={styles.page}>
      <SafeAreaView style={styles.safe}>
        <LinearGradient colors={appColors} style={styles.appShell}>
          {children}
        </LinearGradient>
      </SafeAreaView>
    </LinearGradient>
  );
}

function getThemeGradients(theme: ThemeName) {
  switch (theme) {
    case 'dark':
      // Dark: black + greys
      return {
        pageColors: ['#000000', '#050505'],
        appColors: ['#121212', '#1d1d1d', '#262626'],
      };
    case 'light':
      // Light: soft blue / white mix (text remains readable)
      return {
        pageColors: ['#e3f2fd', '#bbdefb'],
        appColors: ['#ffffff', '#e3f2fd', '#bbdefb'],
      };
    case 'purple':
    default:
      // Original purple theme
      return {
        pageColors: ['#070014', '#070014'],
        appColors: ['#2a0362', '#3b0a85', '#4e16b2'],
      };
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appShell: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
});
