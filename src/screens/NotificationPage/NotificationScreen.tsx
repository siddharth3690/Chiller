import { FlatList, ListRenderItem, StyleSheet, Text, View, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import NotificationCard from '../../components/NotificationCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_ID_KEY } from '../../utils/constants';
import { supabase } from '../../utils/superbase';

type Sender = {
  id: string
  name: string;
}

const NotificationScreen = () => {
  const [sender, setSender] = useState<Sender[]>([])
  const [self, setSelf] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getSelf = async (): Promise<void> => {
    try {
      const self_id = await AsyncStorage.getItem(USER_ID_KEY)
      self_id ? setSelf(self_id) : setSelf('')
    } catch (error) {
      console.error('Error getting user ID from AsyncStorage:', error)
    }
  }

  const getSender = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Step 1: Get sender_id(s) from connections
      const { data: connections, error: connError } = await supabase
        .from('connections')
        .select('requester_id')
        .eq('addressee_id', self)
        .eq('status', 'pending');

      if (connError) {
        console.error('Error fetching connections:', connError.message);
        setSender([])
        return;
      }

      const senderIds = connections?.map((item) => item.requester_id) || [];

      if (senderIds.length === 0) {
        console.log('No pending senders found.');
        setSender([])
        return;
      }

      // Step 2: Get sender info from users table
      const { data: senderInfo, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', senderIds);

      if (userError) {
        console.error('Error fetching sender info:', userError.message);
        setSender([])
        return;
      }

      // Step 3: Update state
      const finalInfo: Sender[] = senderInfo?.map((item) => ({
        id: item.id,
        name: item.name
      })) || [];
      
      setSender(finalInfo);

    } catch (err) {
      console.error('Unexpected error in getSender:', err);
      setSender([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  };

  
  const onRefresh = () => {
    getSender(true)
  }

  const loadData = async () => {
    await getSelf()
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (self) {
      getSender()
    }
  }, [self])

  const renderList: ListRenderItem<Sender> = ({ item }) => (
    <NotificationCard sender_name={item.name} self_id={self} sender_id={item.id} />
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Connection Requests</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any pending connection requests at the moment.
      </Text>
    </View>
  )

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000000" />
      <Text style={styles.loadingText}>Loading notifications...</Text>
    </View>
  )

  if (loading) {
    return renderLoadingState()
  }

  return (
    <View style={styles.container}>
      <FlatList 
        data={sender} 
        renderItem={renderList} 
        keyExtractor={(item) => item.id}
        contentContainerStyle={sender.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']} // Android
            tintColor="#000000" // iOS
          />
        }
      />
    </View>
  )
}

export default NotificationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 16,
  },
});