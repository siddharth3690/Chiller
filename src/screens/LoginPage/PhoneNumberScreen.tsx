import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, StatusBar, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp, NativeStackNavigatorProps } from '@react-navigation/native-stack'
import { LoginPageParams } from '../../navigation/StackNavigator'

const { width, height } = Dimensions.get('window')
type PhoneNumberScreenRouteProp = RouteProp<LoginPageParams, "PhoneNumberScreen">;

const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const navigation = useNavigation<NativeStackNavigationProp<LoginPageParams>>()
  const route = useRoute<PhoneNumberScreenRouteProp>();
  const { name } = route.params
  // Basic validation for a 10-digit phone number
  const isPhoneNumberValid = phoneNumber.trim().length === 10;

  const handleContinue = () => {
    if (isPhoneNumberValid) {
      // Navigate to next screen or handle number submission
      console.log('Phone number entered:', phoneNumber.trim())
      navigation.navigate('SignupScreen',{name : name , phone : phoneNumber})
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
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
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.stepText}>Step 2 of 3</Text>
            <Text style={styles.title}>What's your number?</Text>
            <Text style={styles.subtitle}>
              Your number is used for verification and to help friends connect with you.
            </Text>
          </View>
          
          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                autoFocus={true}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>
          
          {/* Action Section */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                { opacity: isPhoneNumberValid ? 1 : 0.5 }
              ]}
              onPress={handleContinue}
              disabled={!isPhoneNumberValid}
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

export default PhoneNumberScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  },
  headerSection: {
    alignItems: 'center',
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
    // Updated for Step 2
    width: '66%',
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
    // Added for country code layout
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '500',
    marginRight: 8,
  },
  input: {
    // Adjusted for country code layout
    flex: 1, 
    fontSize: 18,
    color: '#000000',
    paddingVertical: 16,
    fontWeight: '500',
    textAlign: 'left', // Changed from center
  },
  actionSection: {
    gap: 16,
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