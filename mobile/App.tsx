import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { PlayerProvider } from './src/contexts/PlayerContext';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import GlobalPlayer from './src/components/GlobalPlayer';
import { colors } from './src/theme/colors';
import { setupPlayer } from './src/services/audioPlayer';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 24 }}>🔍</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Library"
            component={LibraryScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 24 }}>📚</Text>
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 24 }}>🕐</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 24 }}>📊</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      {/* Global Player - Always visible when track is playing */}
      <GlobalPlayer />

      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize audio player on app load
    setupPlayer();
  }, []);

  return (
    <PlayerProvider>
      <AppNavigator />
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
