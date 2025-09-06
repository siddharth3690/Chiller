import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, StatusBar, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack'
import { LoginPageParams } from '../../navigation/StackNavigator'

const { width, height } = Dimensions.get('window')

const NameScreen = () => {
  const [name, setName] = useState('')
  const navigation = useNavigation<NativeStackNavigationProp<LoginPageParams>>()

  const handleContinue = () => {
    if (name.trim()) {
      // Navigate to next screen or handle name submission
      console.log('Name entered:', name.trim())
      navigation.navigate('PhoneNumberScreen',{name : name})
    }
  }

  return (
    // FIX 1: Use SafeAreaView as the root component to respect device notches and home bars.
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient is now inside the SafeAreaView */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa', '#f1f3f4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingCircle, styles.circle1]} />
        <View style={[styles.floatingCircle, styles.circle2]} />
      </View>
      
      {/* FIX 2: KeyboardAvoidingView is now INSIDE the SafeAreaView */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} // It needs to fill the safe area
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.stepText}>Step 1 of 3</Text>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>
              Let's start with the basics. Your name helps others recognize you.
            </Text>
          </View>
          
          {/* Input Section (Keeps the flex: 1 to remain centered) */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={name}
                onChangeText={setName}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {name.length > 0 && (
              <Text style={styles.characterCount}>
                {name.length} characters
              </Text>
            )}
          </View>
          
          {/* Action Section */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                { opacity: name.trim() ? 1 : 0.5 }
              ]}
              onPress={handleContinue}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default NameScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Set background color here for the safe area
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 100,
  },
  circle1: {
    width: 100,
    height: 100,
    top: height * 0.1,
    right: -50,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: height * 0.2,
    left: -30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    // FIX 3: Removed hardcoded paddingTop. SafeAreaView handles this now.
  },
  headerSection: {
    alignItems: 'center',
    // Added a bit of top padding for spacing, replacing the larger values
    paddingTop: 40, 
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 24,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    paddingHorizontal: 20,
  },
  inputSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  input: {
    fontSize: 18,
    color: '#000000',
    paddingVertical: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 8,
    alignSelf: 'center',
  },
  actionSection: {
    gap: 16,
    // FIX 4: Reduced hardcoded paddingBottom. SafeAreaView handles the main spacing.
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.6)',
    letterSpacing: -0.1,
  },
})