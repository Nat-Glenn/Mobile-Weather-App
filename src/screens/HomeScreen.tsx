import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppShell from '../components/AppShell';
import { RootStackParamList } from '../../App';
import { searchCity, CityLocation } from '../services/weatherApi';
import { useSettings } from '../context/SettingsContext';
import { Ionicons } from '@expo/vector-icons';


type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const RECENT = ['Calgary', 'London', 'Delhi'];

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useSettings();

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  // Colors depending on theme
  const textPrimary = isLight ? '#111111' : '#ffffff';
  const textSubtle = isLight ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.7)';

  const searchOuterBg = isLight
    ? 'rgba(0,0,0,0.04)'
    : 'rgba(40,5,85,0.55)';
  const searchInnerBg = isLight ? '#ffffff' : 'rgba(55,0,120,0.65)';

  const recentBg =
    theme === 'purple'
      ? '#7645ff'
      : isDark
      ? '#2b2b2b'
      : '#ffffff';

  const recentBorder = isLight ? 'rgba(0,0,0,0.08)' : 'transparent';
  const loadingColor = isLight ? '#000000' : '#ffffff';
  const placeholderColor = isLight
    ? 'rgba(0,0,0,0.4)'
    : 'rgba(220,200,255,0.45)';

  const goToCityWithName = async (name: string) => {
    try {
      setLoading(true);
      const loc = await searchCity(name);
      if (!loc) {
        alert('City not found. Try another city name.');
        return;
      }
      navigateToCity(loc);
    } catch (err) {
      alert('Unable to search for this city right now.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToCity = (loc: CityLocation) => {
    navigation.navigate('City', {
      cityName: `${loc.name}, ${loc.country}`,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      country: loc.country,
    });
  };

  const onSubmitSearch = () => {
    if (!query.trim()) return;
    void goToCityWithName(query.trim());
  };

  return (
    <AppShell>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.subtitle, { color: textSubtle }]}>
          Weather App
        </Text>
        <Text style={[styles.title, { color: textPrimary }]}>
          WeatherWiz
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchCard, { backgroundColor: searchOuterBg }]}>
        <View
          style={[
            styles.searchInputWrapper,
            { backgroundColor: searchInnerBg },
          ]}
        >
          <Ionicons
  name="search"
  size={18}
  style={[styles.searchIcon, { color: textPrimary }]}
/>
          <TextInput
            placeholder="Search for a city"
            placeholderTextColor={placeholderColor}
            style={[styles.searchInput, { color: textPrimary }]}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmitSearch}
          />
        </View>

        {loading && (
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <ActivityIndicator color={loadingColor} />
          </View>
        )}
      </View>

      {/* Recently searched */}
      <View style={styles.recentContainer}>
        <Text style={[styles.sectionLabel, { color: textSubtle }]}>
          Recently searched
        </Text>
        {RECENT.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.recentCard,
              {
                backgroundColor: recentBg,
                borderColor: recentBorder,
                borderWidth: recentBorder !== 'transparent' ? 1 : 0,
              },
            ]}
            onPress={() => void goToCityWithName(city)}
          >
            <Text
              style={[
                styles.recentCity,
                { color: isLight ? '#111111' : '#ffffff' },
              ]}
            >
              {city}
            </Text>
            <Text
              style={[
                styles.recentMeta,
                {
                  color: isLight
                    ? 'rgba(0,0,0,0.6)'
                    : 'rgba(240,240,255,0.85)',
                },
              ]}
            >
              Tap to view weather
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchCard: {
    borderRadius: 18,
    padding: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 6,
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  recentContainer: {
    marginTop: 18,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  recentCard: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  recentCity: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 11,
  },
});
