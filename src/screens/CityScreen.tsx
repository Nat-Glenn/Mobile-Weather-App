import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppShell from '../components/AppShell';
import { RootStackParamList } from '../../App';
import {
  CityLocation,
  CityWeather,
  getCityWeather,
} from '../services/weatherApi';
import { useSettings, ThemeName } from '../context/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'City'>;
type Tab = 'hourly' | 'weekly';

export default function CityScreen({ route, navigation }: Props) {
  const { cityName, latitude, longitude, timezone, country } = route.params;
  const { tempUnit, theme } = useSettings();
  const styles = createStyles(theme);

  const [tab, setTab] = useState<Tab>('hourly');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CityWeather | null>(null);

  useEffect(() => {
    const loc: CityLocation = {
      name: cityName,
      country,
      latitude,
      longitude,
      timezone,
    };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getCityWeather(loc);
        setData(result);
      } catch (err) {
        setError('Could not load weather data.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [cityName, latitude, longitude, timezone, country]);

  const goHome = () => navigation.navigate('Home');
  const goSettings = () => navigation.navigate('Settings');

  if (loading) {
    return (
      <AppShell>
        <View style={styles.center}>
          <ActivityIndicator color={styles.loadingColor.color} size="large" />
          <Text style={styles.loadingText}>
            Loading weather for {cityName}...
          </Text>
        </View>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'No data available.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={goHome}>
            <Text style={styles.retryText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <>
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
          {/* City header */}
          <View style={styles.header}>
            <Text style={styles.city}>{data.location.name}</Text>
            <Text style={styles.country}>{data.location.country}</Text>

            <Text style={styles.temp}>
              {formatTemp(data.current.temperature, tempUnit)}°
            </Text>

            <Text style={styles.condition}>
              Feels like {formatTemp(data.current.apparentTemperature, tempUnit)}°
            </Text>

            <Text style={styles.hilo}>
              H: {formatTemp(data.daily[0].maxTemp, tempUnit)}° · L:{' '}
              {formatTemp(data.daily[0].minTemp, tempUnit)}°
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'hourly' && styles.tabActive]}
              onPress={() => setTab('hourly')}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'hourly' && styles.tabTextActive,
                ]}
              >
                Hourly Forecast
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, tab === 'weekly' && styles.tabActive]}
              onPress={() => setTab('weekly')}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'weekly' && styles.tabTextActive,
                ]}
              >
                Weekly Forecast
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'hourly' ? (
            <HourlyAndWidgets data={data} theme={theme} />
          ) : (
            <WeeklyForecast data={data} theme={theme} />
          )}
        </ScrollView>

        {/* Bottom nav: Settings, plus, Home */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={goSettings}>
            <Text style={styles.bottomIcon}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goHome}>
            <Text style={styles.bottomIcon}>⌂</Text>
          </TouchableOpacity>
        </View>
      </>
    </AppShell>
  );
}

/* ---------------- Hourly + Widgets ---------------- */

function HourlyAndWidgets({
  data,
  theme,
}: {
  data: CityWeather;
  theme: ThemeName;
}) {
  const { tempUnit } = useSettings();
  const styles = createStyles(theme);
  const upcoming = getUpcomingHours(data.hourly, 8); // next 8 hours

  return (
    <>
      {/* Hourly strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, marginBottom: 16 }}
        contentContainerStyle={{ gap: 10 }}
      >
        {upcoming.map((point, idx) => {
          const dt = new Date(point.time);
          const label =
            idx === 0
              ? 'Now'
              : dt.toLocaleTimeString([], { hour: 'numeric' });

          return (
            <View
              key={point.time}
              style={[
                styles.hourCard,
                idx === 0 && styles.hourCardActive,
              ]}
            >
              <Text style={styles.hourLabel}>{label}</Text>
              <Text style={styles.hourIcon}>
                {getWeatherIcon(point.weatherCode)}
              </Text>
              <Text style={styles.hourTemp}>
                {formatTemp(point.temperature, tempUnit)}°
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Widgets panel */}
      <View style={styles.detailsPanel}>
        <View style={styles.detailsGrid}>
          {/* Air quality (full width) */}
          <View style={[styles.detailCard, styles.airQualityCard]}>
            <Text style={styles.detailLabel}>Air Quality</Text>
            <Text style={styles.detailValue}>
              {data.airQuality.usAqi != null
                ? `${data.airQuality.usAqi} – ${
                    data.airQuality.usAqi <= 50
                      ? 'Good'
                      : data.airQuality.usAqi <= 100
                      ? 'Moderate'
                      : 'Unhealthy'
                  }`
                : 'Not available'}
            </Text>
          </View>

          {/* UV Index */}
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>UV Index</Text>
            <Text style={styles.detailValue}>
              {Math.round(data.daily[0].uvIndexMax)} –{' '}
              {data.daily[0].uvIndexMax <= 2
                ? 'Low'
                : data.daily[0].uvIndexMax <= 5
                ? 'Moderate'
                : 'High'}
            </Text>
          </View>

          {/* Sunrise */}
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Sunrise</Text>
            <Text style={styles.detailValue}>
              {new Date(data.daily[0].sunrise).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
            <Text style={styles.detailSmall}>
              Sunset:{' '}
              {new Date(data.daily[0].sunset).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Wind */}
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>
              {Math.round(data.current.windSpeed)} km/h
            </Text>
          </View>

          {/* Rainfall */}
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Rainfall</Text>
            <Text style={styles.detailValue}>
              {data.daily[0].precipitationSum.toFixed(1)} mm today
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

/* ---------------- Weekly Forecast ---------------- */

function WeeklyForecast({
  data,
  theme,
}: {
  data: CityWeather;
  theme: ThemeName;
}) {
  const { tempUnit } = useSettings();
  const styles = createStyles(theme);

  return (
    <View style={styles.weeklyList}>
      {data.daily.map((day) => {
        const d = new Date(day.date);
        const label = d.toLocaleDateString(undefined, {
          weekday: 'short',
        });

        return (
          <View key={day.date} style={styles.weeklyCard}>
            <Text style={styles.weekDay}>{label}</Text>
            <Text style={styles.weekTemps}>
              {formatTemp(day.maxTemp, tempUnit)}° /{' '}
              {formatTemp(day.minTemp, tempUnit)}°
            </Text>
            <Text style={styles.weekIcon}>{getWeatherIcon(day.weatherCode)}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ---------------- Helper functions ---------------- */

function getUpcomingHours(
  allHours: CityWeather['hourly'],
  count: number
) {
  const now = new Date();
  let startIndex = allHours.findIndex((h) => new Date(h.time) >= now);
  if (startIndex === -1) startIndex = 0;
  return allHours.slice(startIndex, startIndex + count);
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️'; // clear sky
  if (code >= 1 && code <= 3) return '⛅'; // partly cloudy
  if (code === 45 || code === 48) return '🌫️'; // fog
  if (code >= 51 && code <= 57) return '🌦️'; // drizzle
  if (code >= 61 && code <= 67) return '🌧️'; // rain
  if (code >= 71 && code <= 77) return '❄️'; // snow
  if (code >= 80 && code <= 82) return '🌧️'; // rain showers
  if (code >= 85 && code <= 86) return '🌨️'; // snow showers
  if (code >= 95 && code <= 99) return '⛈️'; // thunderstorms
  return '☁️';
}

function formatTemp(valueC: number, unit: 'C' | 'F'): number {
  if (unit === 'C') return Math.round(valueC);
  return Math.round((valueC * 9) / 5 + 32);
}

/* ---------------- Themed styles ---------------- */

function createStyles(theme: ThemeName) {
  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  const isPurple = theme === 'purple';

  const textPrimary = isLight ? '#111111' : '#ffffff';
  const textSecondary = isLight
    ? 'rgba(0,0,0,0.65)'
    : 'rgba(255,255,255,0.7)';

  const errorColor = isLight ? '#b00020' : '#ffb3b3';
  const accent = isPurple
    ? 'rgba(150,110,255,0.95)'
    : isDark
    ? '#3f51b5'
    : '#1976d2';

  const tabsBg = isLight
    ? 'rgba(0,0,0,0.05)'
    : isPurple
    ? 'rgba(35,10,80,0.85)'
    : '#1f1f1f';

  const hourCardBg = isPurple
    ? 'rgba(25,5,60,0.9)'
    : isDark
    ? '#2a2a2a'
    : '#ffffff';

  const hourCardActiveBg = isPurple
    ? 'rgba(190,140,255,1)'
    : isDark
    ? '#616161'
    : '#1976d2';

  const panelBg = isPurple
    ? 'rgba(26,5,60,0.92)'
    : isDark
    ? '#1f1f1f'
    : 'rgba(0,0,0,0.04)';

  const detailCardBg = isPurple
    ? 'rgba(60,20,120,0.95)'
    : isDark
    ? '#2b2b2b'
    : '#ffffff';

  const weeklyBg = isPurple
    ? 'rgba(30,10,75,0.95)'
    : isDark
    ? '#181818'
    : 'rgba(0,0,0,0.04)';

  const weeklyCardBg = isPurple
    ? 'rgba(50,20,110,0.9)'
    : isDark
    ? '#252525'
    : '#ffffff';

  const bottomNavBg = isPurple
    ? 'rgba(20,4,60,0.95)'
    : isDark
    ? '#111111'
    : '#f0f0f0';

  const loadingColor = isLight ? { color: '#000000' } : { color: '#ffffff' };

  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingColor,
    loadingText: {
      marginTop: 8,
      color: textPrimary,
    },
    errorText: {
      color: errorColor,
      marginBottom: 12,
    },
    retryBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: accent,
    },
    retryText: {
      color: '#ffffff',
      fontWeight: '600',
    },

    header: {
      alignItems: 'center',
      marginBottom: 12,
    },
    city: {
      fontSize: 20,
      fontWeight: '600',
      color: textPrimary,
    },
    country: {
      fontSize: 13,
      color: textSecondary,
      marginBottom: 4,
    },
    temp: {
      fontSize: 52,
      fontWeight: '700',
      color: textPrimary,
    },
    condition: {
      fontSize: 14,
      color: textSecondary,
      marginTop: 2,
    },
    hilo: {
      fontSize: 12,
      color: textSecondary,
      marginTop: 2,
    },

    tabs: {
      flexDirection: 'row',
      backgroundColor: tabsBg,
      borderRadius: 999,
      padding: 4,
      marginBottom: 10,
    },
    tab: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 6,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: accent,
    },
    tabText: {
      fontSize: 11,
      color: textSecondary,
    },
    tabTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },

    hourCard: {
      width: 70,
      borderRadius: 20,
      backgroundColor: hourCardBg,
      alignItems: 'center',
      paddingVertical: 6,
      borderWidth: isLight && !isPurple ? 1 : 0,
      borderColor: isLight && !isPurple ? 'rgba(0,0,0,0.05)' : 'transparent',
    },
    hourCardActive: {
      backgroundColor: hourCardActiveBg,
    },
    hourLabel: { fontSize: 11, color: textSecondary },
    hourIcon: { fontSize: 16, marginVertical: 4 },
    hourTemp: {
      fontSize: 13,
      fontWeight: '600',
      color: isLight && !isPurple ? '#111111' : '#ffffff',
    },

    detailsPanel: {
      backgroundColor: panelBg,
      borderRadius: 22,
      padding: 10,
      marginTop: 4,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 8,
      rowGap: 8,
    },
    detailCard: {
      width: '47%',
      borderRadius: 16,
      backgroundColor: detailCardBg,
      padding: 8,
      borderWidth: isLight && !isPurple ? 1 : 0,
      borderColor: isLight && !isPurple ? 'rgba(0,0,0,0.05)' : 'transparent',
    },
    airQualityCard: {
      width: '100%',
    },
    detailLabel: {
      fontSize: 11,
      color: textSecondary,
      marginBottom: 2,
      fontWeight: '600',
    },
    detailValue: {
      fontSize: 13,
      color: textPrimary,
    },
    detailSmall: {
      fontSize: 11,
      color: textSecondary,
    },

    weeklyList: {
      marginTop: 10,
      backgroundColor: weeklyBg,
      borderRadius: 20,
      paddingVertical: 4,
    },
    weeklyCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      marginVertical: 2,
      backgroundColor: weeklyCardBg,
      borderWidth: isLight && !isPurple ? 1 : 0,
      borderColor: isLight && !isPurple ? 'rgba(0,0,0,0.05)' : 'transparent',
    },
    weekDay: {
      color: textPrimary,
      fontSize: 13,
    },
    weekTemps: {
      color: textPrimary,
      fontSize: 13,
    },
    weekIcon: {
      fontSize: 16,
    },

    bottomNav: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 10,
      borderRadius: 999,
      backgroundColor: bottomNavBg,
      paddingHorizontal: 24,
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bottomIcon: {
      fontSize: 22,
      color: textPrimary,
    },
    plus: {
      fontSize: 30,
      color: textPrimary,
    },
  });
}
