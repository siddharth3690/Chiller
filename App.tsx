import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import * as Updates from 'expo-updates';
import { CONTACTS_SYNCED_KEY, USER_CONTACTS_KEY } from './src/utils/constants';
import { AuthProvider } from './src/context/AuthContext';


/**
 * Custom hook to handle OTA updates
 */
function useOTAUpdates() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          // Ask user if they want to update now
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Restart to update?',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Restart Now', onPress: async () => await Updates.fetchUpdateAsync().then(() => Updates.reloadAsync()) }
            ]
          );
        }
      } catch (error) {
        console.log('Error checking updates:', error);
      }
    };

    checkForUpdates();
  }, []);
}

export default function App() {
  const [status, setStatus] = useState('Checking permissions...');

  // Hook for OTA updates
 //  useOTAUpdates();

  const clear_data = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Successfully cleared');
    } catch (error) {
      console.log('Could not clear:', error);
    }
  };

  const syncContactsOnFirstLaunch = async () => {
    try {
      const hasSynced = await AsyncStorage.getItem(CONTACTS_SYNCED_KEY);
      if (hasSynced === 'true') return;

      setStatus('Requesting contact permissions...');
      const { status: permissionStatus } = await Contacts.requestPermissionsAsync();

      if (permissionStatus !== 'granted') {
        setStatus('Permission to access contacts was denied. 😟');
        Alert.alert(
          'Permission Required',
          'This app needs to access your contacts to function. Please grant permission in your phone settings.'
        );
        return;
      }

      setStatus('Permission granted! Fetching contacts...');
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const numbers = data
          .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
          .flatMap((c) => c.phoneNumbers!.map((p) => p.number))
          .filter((number: any) => number);

        const processedContacts = [...new Set(numbers)];

        await AsyncStorage.setItem(USER_CONTACTS_KEY, JSON.stringify(processedContacts));
        await AsyncStorage.setItem(CONTACTS_SYNCED_KEY, 'true');

        setStatus(`Success! ${processedContacts.length} contacts saved.`);
        console.log('Contacts saved successfully!');
      } else {
        setStatus('No contacts with phone numbers found.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setStatus('An error occurred during the process.');
    }
  };

  useEffect(() => {
    // Runs once when the app starts
    syncContactsOnFirstLaunch();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
