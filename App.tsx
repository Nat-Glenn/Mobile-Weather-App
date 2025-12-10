import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CityScreen from './src/screens/CityScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { SettingsProvider } from './src/context/SettingsContext';

export type RootStackParamList = {
  Home: undefined;
  City: {
    cityName: string;
    latitude: number;
    longitude: number;
    timezone: string;
    country: string;
  };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="City" component={CityScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
