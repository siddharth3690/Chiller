import { StyleSheet, Text, View, FlatList, RefreshControl, SafeAreaView, ListRenderItem } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_ID_KEY } from '../../utils/constants';
import { supabase } from '../../utils/superbase';
import PostCard from '../../components/PostCard';

// --- Type Definitions ---
// NOTE: Renamed PostParams to Post for clarity and corrected 'content_head' to 'content_header' to match the database response.
type PostParams = {
  id: string;
  content_header: string;
  content?: string;
  sender_name: string;
};

const HomeScreen = () => {
  // NOTE: Renamed state variables to plural 'posts' and 'setPosts' for convention, as they handle an array.
  const [posts, setPosts] = useState<PostParams[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // NOTE: Renamed getPost to getPosts for convention.
  const getPosts = useCallback(async () => {
    setRefreshing(true); // Start the refresh indicator
    const self = await AsyncStorage.getItem(USER_ID_KEY);
    if (!self) {
      setRefreshing(false);
      setIsLoading(false);
      return; // Don't fetch if no user ID
    }

    try {
      // This is the only code you need now!
      const { data: raw_posts, error } = await supabase.rpc('get_news_feed', {
        // The object keys MUST match the function's argument names
        user_id_input: self,
      });

      if (error) {
        throw new Error(`Error calling RPC function: ${error.message}`);
      }

      const finalPost: PostParams[] = raw_posts?.map(
        (item: {
          post_id: string;
          content_header: string;
          content: string;
          author_name: string;
        }) => ({
          id: item.post_id,
          content_header: item.content_header,
          content: item.content,
          sender_name: item.author_name,
        })
      );
      setPosts(finalPost);
      console.log(finalPost);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setRefreshing(false); // Stop the refresh indicator
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  const renderList: ListRenderItem<PostParams> = ({ item }) => (
    <PostCard
      sender={item.sender_name}
      content_header={item.content_header}
      content={item.content}
    />
  );

  const renderEmptyList = () => {
    if (isLoading) {
      return null; // Don't show the "No posts" message while loading
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts to display. Pull down to refresh!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{height : 10}}/>
      <FlatList
        data={posts}
        renderItem={renderList}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getPosts} />
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

// NOTE: Added basic styles for rendering the list.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingHorizontal :  10
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  postHeader: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
});