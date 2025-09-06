import { ListRenderItem, StyleSheet, Text, View, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../utils/superbase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { USER_ID_KEY } from '../../../utils/constants'
import UserCard from '../../../components/UserCard'
import { FlatList } from 'react-native-gesture-handler'

type User = {
    id: string,
    name: string
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

const handelConnect = () => {
    null
}

const DegreeOneScreen = () => {
    const [names, setNames] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getFriends = async (isRefresh = false): Promise<void> => {
        try {
            if (isRefresh) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            setError(null)

            const user_id = await getSelf()
            
            if (!user_id) {
                throw new Error('User ID not found')
            }

            // Get friend IDs
            const { data: friendIds, error: friendIdsError } = await supabase
                .from('user_degrees')
                .select('friend_id')
                .eq('self_id', user_id)
                .eq('degree', 1)

            if (friendIdsError) {
                throw new Error(`Error fetching friend IDs: ${friendIdsError.message}`)
            }

            if (!friendIds || friendIds.length === 0) {
                setNames([])
                return
            }

            const friendIdList = friendIds.map((item) => item.friend_id)

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

            // Map the data to User type
            const finalNames: User[] = friendData.map((friend) => ({
                id: friend.id,
                name: friend.name,
            }))

            setNames(finalNames)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
            console.error('Error in getFriends:', errorMessage)
            setError(errorMessage)
            setNames([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = () => {
        getFriends(true)
    }

    useEffect(() => {
        getFriends()
    }, [])

    const renderItem: ListRenderItem<User> = ({ item }) => (
        <UserCard
            name={item.name}
            status={'accepted'}
            connect={() => handelConnect()}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No First Degree Connections</Text>
            <Text style={styles.emptySubtitle}>
                You don't have any first degree connections yet. Start connecting with people to build your network!
            </Text>
        </View>
    )

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <Text style={styles.errorRetry}>Pull down to retry</Text>
        </View>
    )

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading your connections...</Text>
        </View>
    )

    if (loading) {
        return (
            <View style={styles.container}>
                {renderLoadingState()}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>First Degree Connections</Text>
            
            <FlatList 
                data={names} 
                renderItem={renderItem} 
                keyExtractor={(item) => item.id}
                contentContainerStyle={names.length === 0 || error ? styles.emptyList : styles.list}
                ListEmptyComponent={error ? renderErrorState : renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#000000']} // Android
                        tintColor="#000000" // iOS
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default DegreeOneScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    list: {
        padding: 16,
        paddingTop: 8,
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
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ef4444',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtitle: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    errorRetry: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.6)',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.6)',
        marginTop: 16,
    },
});