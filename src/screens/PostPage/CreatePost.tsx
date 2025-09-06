import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { USER_ID_KEY } from '../../utils/constants'
import { supabase } from '../../utils/superbase'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { PostPageParams } from '../../navigation/StackNavigator'

const CreatePost = () => {
    const [header, setHeader] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({ header: '', content: '', general: '' })

    const navigation = useNavigation<NativeStackNavigationProp<PostPageParams>>()

    const validateForm = () => {
        const newErrors = { header: '', content: '', general: '' }
        let isValid = true

        if (!header.trim()) {
            newErrors.header = 'Title is required'
            isValid = false
        } else if (header.length > 100) {
            newErrors.header = 'Title must be less than 100 characters'
            isValid = false
        }

        

        setErrors(newErrors)
        return isValid
    }

    const updateDatabase = async () => {
        try {
            const self = await AsyncStorage.getItem(USER_ID_KEY)

            if (!self) {
                setErrors(prev => ({ ...prev, general: 'User not found. Please log in again.' }))
                return false
            }

            const { error } = await supabase.from('posts').insert([{
                'content_header': header.trim(),
                'content': content.trim(),
                'author_id': self
            }])

            if (error) {
                console.error('Database error:', error)
                setErrors(prev => ({ ...prev, general: 'Failed to create post. Please try again.' }))
                return false
            }

            return true
        } catch (err) {
            console.error('Unexpected error:', err)
            setErrors(prev => ({ ...prev, general: 'An unexpected error occurred. Please try again.' }))
            return false
        }
    }

    const handlePost = async () => {
        // Clear previous errors
        setErrors({ header: '', content: '', general: '' })

        // Validate form
        if (!validateForm()) {
            return
        }

        setLoading(true)

        const success = await updateDatabase()

        if (success) {
            // Show success message
            Alert.alert(
                'Success',
                'Post created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('PostScreen')
                    }
                ]
            )
        }

        setLoading(false)
    }

    const handleCancel = () => {
        Alert.alert(
            'Cancel Post',
            'Are you sure you want to cancel? Your changes will be lost.',
            [
                { text: 'Keep Writing', style: 'cancel' },
                { text: 'Cancel Post', style: 'destructive', onPress: () => navigation.goBack() }
            ]
        )
    }

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Create Post</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.form}>
                {/* General Error */}
                {errors.general ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errors.general}</Text>
                    </View>
                ) : null}

                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={[styles.input, errors.header ? styles.inputError : null]}
                        placeholder="Enter post title..."
                        value={header}
                        onChangeText={(text) => {
                            setHeader(text)
                            if (errors.header) {
                                setErrors(prev => ({ ...prev, header: '' }))
                            }
                        }}
                        maxLength={100}
                        editable={!loading}
                    />
                    <Text style={styles.charCount}>{header.length}/100</Text>
                    {errors.header ? (
                        <Text style={styles.fieldError}>{errors.header}</Text>
                    ) : null}
                </View>

                {/* Content Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Content </Text>
                    <TextInput
                        style={[styles.textArea, errors.content ? styles.inputError : null]}
                        placeholder="What's on your mind?"
                        value={content}
                        onChangeText={(text) => {
                            setContent(text)
                            if (errors.content) {
                                setErrors(prev => ({ ...prev, content: '' }))
                            }
                        }}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        editable={!loading}
                    />
                    <Text style={styles.charCount}>{content.length} characters</Text>
                    {errors.content ? (
                        <Text style={styles.fieldError}>{errors.content}</Text>
                    ) : null}
                </View>

                {/* Post Button */}
                <TouchableOpacity
                    style={[styles.postButton, loading && styles.postButtonDisabled]}
                    onPress={handlePost}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.postButtonText}>Create Post</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

export default CreatePost

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
    },
    cancelButton: {
        padding: 8,
    },
    cancelText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    form: {
        padding: 16,
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF3B30',
    },
    errorText: {
        color: '#C62828',
        fontSize: 14,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        minHeight: 120,
    },
    inputError: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF5F5',
    },
    charCount: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'right',
        marginTop: 4,
    },
    fieldError: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    postButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    postButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    postButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
})