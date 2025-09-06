import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/superbase';

// You can use LinearGradient for backgrounds.
// import { LinearGradient } from 'expo-linear-gradient';

// Define the component's props for type safety.
interface NotificationCardParams {
    sender_name: string;
    self_id: string;
    sender_id: string
    profile?: string; // Optional URL for a profile image
}

type StatusParams = 'accepted' | 'rejected' | 'pending'

const NotificationCard: React.FC<NotificationCardParams> = ({ sender_name, profile, sender_id, self_id }) => {
    const [status, setStatus] = useState<StatusParams>('pending')

    const onAccept = async () => {
        try {
            const { error } = await supabase
                .from('connections')
                .update({ status: 'accepted' })
                .eq('requester_id', sender_id)
                .eq('addressee_id', self_id);

            if (error) {
                console.error('Error accepting request:', error.message);
            } else {
                console.log('Request accepted ✅');
                setStatus('accepted')
            }
        } catch (err) {
            console.error('Unexpected error in onAccept:', err);
        }
    };

    const onReject = async () => {
        try {
            const { error } = await supabase
                .from('connections')
                .update({ status: 'rejected' })
                .eq('requester_id', sender_id)
                .eq('addressee_id', self_id);

            if (error) {
                console.error('Error rejecting request:', error.message);
            } else {
                console.log('Request rejected ❌');
                setStatus('rejected')
            }
        } catch (err) {
            console.error('Unexpected error in onReject:', err);
        }
    };

    const renderActionButtons = () => {
        if (status === 'accepted') {
            return (
                <View style={styles.statusContainer}>
                    <Text style={styles.acceptedText}>✅ Connected</Text>
                </View>
            );
        }

        if (status === 'rejected') {
            return (
                <View style={styles.statusContainer}>
                    <Text style={styles.rejectedText}>❌ Declined</Text>
                </View>
            );
        }

        // Pending state - show buttons
        return (
            <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={onAccept} style={[styles.button, styles.acceptButton]}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onReject} style={[styles.button, styles.rejectButton]}>
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[
            styles.container,
            status === 'accepted' && styles.acceptedContainer,
            status === 'rejected' && styles.rejectedContainer
        ]}>
            {/* Profile Icon or Image */}
            {profile ? (
                <View style={styles.profileContainer}>
                    <Image source={{ uri: profile }} style={styles.profileImage} />
                </View>
            ) : (
                <View style={[styles.profileContainer, styles.defaultProfile]}>
                    <Ionicons name="person" size={24} color="#000" />
                </View>
            )}

            {/* User Name */}
            <Text style={styles.userName}>{sender_name}</Text>

            {/* Action Buttons or Status */}
            {renderActionButtons()}
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
    acceptedContainer: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    rejectedContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
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
    buttonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButton: {
        backgroundColor: '#000000',
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    rejectButton: {
        backgroundColor: 'transparent',
        marginLeft: 8,
    },
    rejectButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.6)',
    },
    statusContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    acceptedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
    },
    rejectedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
    },
});

export default NotificationCard;