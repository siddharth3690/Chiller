import { View, Text, ListRenderItem, FlatList, RefreshControl, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { USER_ID_KEY } from '../../utils/constants'
import { supabase } from '../../utils/superbase'
import PostCard from '../../components/PostCard'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { PostPageParams } from '../../navigation/StackNavigator'

type PostParams = {
  id: string,
  content_head: string,
  content?: string
}

const PostScreen = () => {
  const [post, setPost] = useState<PostParams[]>([])
  const [self, setSelf] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<NativeStackNavigationProp<PostPageParams>>()

  const getSelf = async (): Promise<void> => {
    try {
      const self_id = await AsyncStorage.getItem(USER_ID_KEY)
      self_id ? setSelf(self_id) : setSelf('')
    } catch (error) {
      console.error('Error getting user ID from AsyncStorage:', error)
    }
  }

  const getPost = async () => {
    if (!self) return // Don't fetch if no user ID

    try {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("id, content_header, content")
        .eq("author_id", self)

      if (error) {
        console.error("Error fetching posts:", error.message)
        return
      }

      const finalPosts: PostParams[] =
        posts?.map((item) => ({
          id: item.id,
          content: item.content,
          content_head: item.content_header,
        })) || []

      setPost(finalPosts)
    } catch (err) {
      console.error("Unexpected error in getPost:", err)
    }
  }

  const handleAddPost = () => {
    
    navigation.navigate('CreatePostScreen')
    console.log('Navigate to add post screen')
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await getSelf()
    await getPost()
    setRefreshing(false)
  }, [self])

  useEffect(() => {
    getSelf()
  }, [])

  useEffect(() => {
    if (self) {
      getPost()
    }
  }, [self])

  const renderItems: ListRenderItem<PostParams> = ({ item }) => (
    <PostCard content_header={item.content_head} content={item.content} />
  )

  const renderEmptyComponent = () => (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text>No posts yet</Text>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1 , paddingHorizontal : 10}}>
      <Text style={{ padding: 16, fontSize: 18, fontWeight: 'bold' }}>Your Posts</Text>
      <FlatList
        data={post}
        renderItem={renderItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
      
      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddPost}
        activeOpacity={0.8}
      >
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  plusIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
})

export default PostScreen