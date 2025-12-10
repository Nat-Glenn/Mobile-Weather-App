import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppShell from '../components/AppShell';
import { RootStackParamList } from '../../App';
import { useSettings } from '../context/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { theme, tempUnit, setTheme, setTempUnit } = useSettings();

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  // Theme-aware colors
  const textPrimary = isLight ? '#111111' : '#ffffff';
  const textSubtle = isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.75)';
  const sectionBg = isLight ? '#ffffff' : 'rgba(255,255,255,0.04)';
  const optionBorder = isLight
    ? 'rgba(0,0,0,0.12)'
    : 'rgba(255,255,255,0.35)';
  const optionSelectedBg = isLight
    ? 'rgba(25,118,210,0.08)'
    : 'rgba(255,255,255,0.15)';
  const optionTextDefault = textSubtle;
  const optionTextSelected = isLight ? '#111111' : '#ffffff';

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textPrimary }]}>Settings</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.close, { color: textPrimary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Theme section */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Theme
          </Text>
          <View style={styles.row}>
            {(['purple', 'light', 'dark'] as const).map((t) => {
              const selected = theme === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.option,
                    {
                      borderColor: optionBorder,
                      backgroundColor: selected
                        ? optionSelectedBg
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setTheme(t)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: selected
                          ? optionTextSelected
                          : optionTextDefault,
                        fontWeight: selected ? '700' : '500',
                      },
                    ]}
                  >
                    {t === 'purple'
                      ? 'Purple'
                      : t === 'light'
                      ? 'Light'
                      : 'Dark'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Temperature unit section */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Temperature units
          </Text>
          <View style={styles.row}>
            {(['C', 'F'] as const).map((u) => {
              const selected = tempUnit === u;
              return (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.option,
                    {
                      borderColor: optionBorder,
                      backgroundColor: selected
                        ? optionSelectedBg
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setTempUnit(u)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: selected
                          ? optionTextSelected
                          : optionTextDefault,
                        fontWeight: selected ? '700' : '500',
                      },
                    ]}
                  >
                    °{u}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  close: {
    fontSize: 20,
  },
  section: {
    marginBottom: 18,
    borderRadius: 16,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
  },
  helper: {
    fontSize: 13,
  },
});
