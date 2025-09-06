import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';

type Status = "pending" | "accepted" | "rejected";

interface UserCardParams {
  name: string;
  profile?: string;
  connect: () => void;
  status?: string; // Made optional and consistent with Status type
  mutual ?: string;
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap>= {
  pending: "time-outline",
  accepted: "checkmark-done",
  rejected: "close",
};


const UserCard: React.FC<UserCardParams> = ({ name, profile, connect, status, mutual }) => {
  const renderIcon = () => {
    if (status) {
      const iconName = iconMap[status];
      return <Ionicons name={iconName} size={24} color="#000" />;
    }
    // Default state - no connection yet
    return <AntDesign name="plus" size={24} color="#000" />;
  };

  const getButtonStyle = () => {
    const baseStyle = styles.connectButton;
    
    if (status === 'accepted') {
      return [baseStyle, styles.acceptedButton];
    } else if (status === 'rejected') {
      return [baseStyle, styles.rejectedButton];
    } else if (status === 'pending') {
      return [baseStyle, styles.pendingButton];
    }
    
    return baseStyle;
  };

  return (
    <View style={styles.container}>
      {profile ? (
        <View style={styles.profileContainer}>
          <Image source={{ uri: profile }} style={styles.profileImage} />
        </View>
      ) : (
        <View style={[styles.profileContainer, styles.defaultProfile]}>
          <Ionicons name="person" size={24} color="#666" />
        </View>
      )}
      <Text style={styles.userName}>{name}</Text>
      {mutual  && <Text style={styles.mutualName}>Mutual- {mutual}</Text>}
      <TouchableOpacity 
        onPress={connect} 
        style={getButtonStyle()}
        disabled={status === 'pending'} // Disable if pending
      >
        {renderIcon()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  profileContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  defaultProfile: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    letterSpacing: -0.2,
  },
  mutualName :{
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: '#010000ff',
    letterSpacing: -0.2,
  },
  connectButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  acceptedButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)', // Green tint
  },
  rejectedButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Red tint
  },
  pendingButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)', // Yellow tint
    opacity: 0.7,
  },
});

export default UserCard;