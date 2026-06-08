import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider, useApp } from './src/context/AppContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { TaskDetailsScreen } from './src/screens/TaskDetailsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Tasks: undefined;
  TaskDetails: { taskId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationRouter() {
  const { isAuthenticated } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // App Stack
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'light-content'}
          backgroundColor="#000000"
        />
        <NavigationRouter />
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
