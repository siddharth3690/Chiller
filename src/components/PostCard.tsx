import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView,
  StatusBar 
} from 'react-native';

interface PostCardParam {
  sender?: string;
  content_header: string;
  content?: string;
}

const PostCard: React.FC<PostCardParam> = ({ content_header, content, sender }) => {
  return (
    <View style={styles.postContainer}>
      {sender && <Text style={styles.sender}>@{sender}</Text>}
      <Text style={styles.header}>{content_header}</Text>
      {content && (
        <Text style={styles.content}>{content}</Text>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  postContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sender: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
    marginBottom: 6,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    fontWeight: '400',
    color: '#495057',
    lineHeight: 22,
  },
});

export default PostCard;