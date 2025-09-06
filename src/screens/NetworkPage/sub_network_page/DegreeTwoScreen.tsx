import { View, Text, FlatList, ListRenderItem, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import UserCard from '../../../components/UserCard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { USER_ID_KEY } from '../../../utils/constants'
import { supabase } from '../../../utils/superbase'

type User = {
    id: string,
    name: string
    mutual?: string
}

const getSelf = async (): Promise<string | null> => {
    try {
        const self_id = await AsyncStorage.getItem(USER_ID_KEY)
        return self_id
    } catch (error) {
        console.error('Error getting user ID from AsyncStorage:', error)
        return null
    }
}

const handleConnect = () => {
    // TODO: Implement connect functionality
    console.log('Connect button pressed')
}

const DegreeTwoScreen = () => {
    const [names, setNames] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getFriends = async (): Promise<void> => {
        try {
            setLoading(true)
            setError(null)

            const user_id = await getSelf()

            if (!user_id) {
                throw new Error('User ID not found')
            }

            // Get friend IDs
            const { data: friendIds, error: friendIdsError } = await supabase
                .from('user_degrees')
                .select('friend_id,mutual_friend_id')
                .eq('self_id', user_id)
                .eq('degree', 2)

            if (friendIdsError) {
                throw new Error(`Error fetching friend IDs: ${friendIdsError.message}`)
            }

            if (!friendIds || friendIds.length === 0) {
                setNames([])
                return
            }

            const friendIdList = friendIds.map((item) => item.friend_id)
            const mutualIdList = friendIds.map((item) => item.mutual_friend_id)

            // Get friend names and IDs
            const { data: friendData, error: friendDataError } = await supabase
                .from('users')
                .select('name, id')
                .in('id', friendIdList)

            if (friendDataError) {
                throw new Error(`Error fetching friend data: ${friendDataError.message}`)
            }

            if (!friendData) {
                setNames([])
                return
            }

            // Get mutual friend names and IDs
            const { data: mutualFriendData, error: mutualFriendDataError } = await supabase
                .from('users')
                .select('name, id')
                .in('id', mutualIdList)

            if (mutualFriendDataError) {
                throw new Error(`Error fetching mutual friend data: ${mutualFriendDataError.message}`)
            }

            if (!mutualFriendData) {
                setNames([])
                return
            }

            // Create a proper mapping between friends and their mutual friends
            // Each row in friendIds contains the relationship: friend_id -> mutual_friend_id
            const finalNames: User[] = friendIds.map((relationship) => {
                // Find the friend's data using friend_id
                const friend = friendData.find(f => f.id === relationship.friend_id)
                // Find the mutual friend's data using mutual_friend_id  
                const mutual = mutualFriendData.find(m => m.id === relationship.mutual_friend_id)
                
                //console.log(`Mapping: Friend ID ${relationship.friend_id} (${friend?.name}) -> Mutual ID ${relationship.mutual_friend_id} (${mutual?.name})`)
                
                return {
                    id: friend?.id || '',
                    name: friend?.name || '',
                    mutual: mutual?.name || ''
                }
            }).filter(user => user.id && user.name) // Filter out any invalid entries

            setNames(finalNames)
            console.log(finalNames)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
            console.error('Error in getFriends:', errorMessage)
            setError(errorMessage)
            setNames([])
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await getFriends()
        setRefreshing(false)
    }

    const renderItem: ListRenderItem<User> = ({ item }) => (
        <UserCard
            name={item.name}
            status={'accepted'}
            mutual={item.mutual}
            connect={() => handleConnect()}
        />
    );

    // Use useEffect instead of useState for initial data loading
    useEffect(() => {
        getFriends()
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Degree Two Connections</Text>
                
            </View>
            
            {loading && !refreshing && <Text style={styles.loadingText}>Loading...</Text>}
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
            
            <FlatList 
                data={names} 
                renderItem={renderItem} 
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']} // Android
                        tintColor={'#007AFF'} // iOS
                    />
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <Text style={styles.emptyText}>No mutual connections found</Text>
                    ) : null
                }
                contentContainerStyle={names.length === 0 ? styles.emptyContainer : undefined}
            />
        </View>
    )
}

export default DegreeTwoScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    refreshButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingText: {
        textAlign: 'center',
        marginVertical: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        color: 'red',
        marginVertical: 8,
        textAlign: 'center',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 32,
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
})