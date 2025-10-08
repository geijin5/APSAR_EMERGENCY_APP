import React, {useEffect} from 'react';
import {StatusBar, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import AppNavigator from './components/AppNavigator';
import {theme} from './utils/theme';
import {initializeApp} from './services/AppService';
import {setupPushNotifications} from './services/NotificationService';

const App: React.FC = () => {
  useEffect(() => {
    const initialize = async () => {
      await initializeApp();
      await setupPushNotifications();
    };
    
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.primary}
          />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
