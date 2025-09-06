import { View, Text, ListRenderItem, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { USER_CONTACTS_KEY, USER_ID_KEY } from '../../../utils/constants'
import { supabase } from '../../../utils/superbase'
import { FlatList } from 'react-native-gesture-handler'
import UserCard from '../../../components/UserCard'

interface User {
  id: string,
  name: string,
  profile?: string,
  status: string
}

const getSelf = async (): Promise<string> => {
  const self = await AsyncStorage.getItem(USER_ID_KEY)
  return self ? self : ''
}

type Status = '' | 'rejected' | 'accepted' | 'pending'

const getConnectionStatus = async (currentUserId: string, targetUserId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("connections")
      .select("status")
      .or(`and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`)
      .single()

    if (error) {
      // No connection found, return empty status
      if (error.code === 'PGRST116') {
        return ''
      }
      console.log("error in fetching connection status", error)
      return ''
    }

    return data?.status || ''
  } catch (err) {
    console.log("unexpected error:", err)
    return ''
  }
}

const requestConnection = async (requester: string, addressee: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('connections').insert({
      requester_id: requester,
      addressee_id: addressee,
      status: 'pending'
    })
    if (error) {
      console.log('error sending request', error)
      return false
    }
    return true
  }
  catch (error) {
    console.log('could not connect to supabase', error)
    return false
  }
}

const get_phone_contact = async (): Promise<string[]> => {
  try {
    const numbersJSON = await AsyncStorage.getItem(USER_CONTACTS_KEY);
    const numbersArray = numbersJSON ? JSON.parse(numbersJSON) : [];
    const formatted_numbers = numbersArray.map((num: any) =>
      String(num).replace(/\s+/g, "").replace(/^\+91/, "")
    );
    return formatted_numbers;
  } catch (error) {
    console.log("Could not fetch numbers:", error);
    return [];
  }
};

const PhoneContactScreeen = () => {
  const [names, setNames] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const get_users_in_chiller = async (isRefresh = false): Promise<void> => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const userId = await getSelf()
      setCurrentUserId(userId)

      const local_number = await get_phone_contact()

      if (!local_number || local_number.length === 0) {
        console.log('No local contacts found')
        setNames([])
        return
      }

      const { data: users_data, error } = await supabase
        .from('users')
        .select('id, name')
        .in('phone', local_number)
        .neq('id', userId) // Exclude current user

      if (error) {
        throw error;
      }

      if (!users_data || users_data.length === 0) {
        console.log('No matching users found')
        setNames([])
        return
      }

      console.log('Matching users found:', users_data);

      // Get connection status for each user
      const usersWithStatus = await Promise.all(
        users_data.map(async (user) => {
          const status = await getConnectionStatus(userId, user.id)
          return {
            id: user.id,
            name: user.name || 'Unknown',
            profile: undefined,
            status: status
          }
        })
      )

      setNames(usersWithStatus)

    } catch (error) {
      console.error('Error fetching names from Supabase:', error);
      setNames([])
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleConnect = async (targetUserId: string) => {
    // Find the user to check current status
    const user = names.find(u => u.id === targetUserId)
    
    // Only allow connection if status is empty
    if (!user || user.status !== '') {
      console.log('Cannot connect: status is', user?.status)
      return
    }

    // Immediately update UI to show pending status
    setNames(prevNames => 
      prevNames.map(user => 
        user.id === targetUserId 
          ? { ...user, status: 'pending' }
          : user
      )
    )

    // Send connection request
    const success = await requestConnection(currentUserId, targetUserId)
    
    if (!success) {
      // Revert status if request failed
      setNames(prevNames => 
        prevNames.map(user => 
          user.id === targetUserId 
            ? { ...user, status: '' }
            : user
        )
      )
    }
  }

  const onRefresh = () => {
    get_users_in_chiller(true)
  }

  useEffect(() => {
    get_users_in_chiller()
  }, [])

  const renderItem: ListRenderItem<User> = ({ item }) => (
    <UserCard
      name={item.name}
      profile={item.profile}
      status={item.status}
      connect={() => handleConnect(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading contacts...</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'light', marginBottom: 16, color: 'grey' }}>
        People from your contact in Chiller
      </Text>
      {names.length === 0 ? (
        <Text>No contacts found on the platform</Text>
      ) : (
        <FlatList
          data={names}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF', '#689F38']}
              tintColor="#689F38"
            />
          }
        />
      )}
    </View>
  )
}

export default PhoneContactScreeen