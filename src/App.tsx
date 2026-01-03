import React, {useEffect} from 'react';
import {StatusBar, Platform, View, ActivityIndicator, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import AppNavigator from './components/AppNavigator';
import {theme} from './utils/theme';
import {initializeApp} from './services/AppService';
import {setupPushNotifications} from './services/NotificationService';
import {AuthProvider} from './contexts/AuthContext';
import {colors} from './utils/theme';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp();
        await setupPushNotifications();
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initialize();
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor={theme.colors.primary}
            />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default App;
