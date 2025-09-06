import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView,
  ActivityIndicator // Import ActivityIndicator for loading state
} from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Assuming you have a StackNavigator that includes an 'Otp' screen
// which accepts an email parameter.
type AuthStackParamList = {
  Email: undefined;
  Otp: { email: string };
  // ... other screens
};

// Import your configured Supabase client
import { supabase } from '../../utils/superbase'; 
import { LoginPageParams } from '../../navigation/StackNavigator'

const { width, height } = Dimensions.get('window')

const SigninScreen = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigation = useNavigation<NativeStackNavigationProp<LoginPageParams>>();

  // Basic email validation regex
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContinue = async () => {
    
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);
    setError(null);

    //console.log("OTP sent successfully!");
    //navigation.navigate('OtpScreen', { email: email.trim() });
    
    try {
      // 1. Check if the email already exists in the 'profiles' table.
      //    Adjust 'profiles' to your actual table name if different.
      const { data, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.trim())
        .single(); // .single() is efficient for checking existence

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is what we want.
        // Any other error is a real problem.
        throw checkError;
      }
      console.log(data)
      if (data == null) {
        // If data is not found, the email does notvalready exists.
        setError("An account with this email does not exists.");
        setLoading(false);
        return;
      }

      // 2. If email does  exist, send OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });

      if (otpError) {
        throw otpError;
      }

      // 3. Navigate to OTP screen on success
      
      console.log("OTP sent successfully!");
      navigation.navigate('OtpScreen', { email: email.trim() });

    } catch (err: any) {
      console.error("Error during sign-up process:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
    
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#ffffff', '#f8f9fa', '#f1f3f4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      <View style={styles.floatingElements}>
        <View style={[styles.floatingCircle, styles.circle1]} />
        <View style={[styles.floatingCircle, styles.circle2]} />
      </View>
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <View style={{height : 30}}></View>
            <Text style={styles.title}>What's your email?</Text>
            <Text style={styles.subtitle}>
              We'll send a verification code to ensure it's you.
            </Text>
          </View>
          
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null); // Clear error on new input
                }}
                autoFocus={true}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
          
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                { opacity: isEmailValid && !loading ? 1 : 0.5 }
              ]}
              onPress={handleContinue}
              disabled={!isEmailValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
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

export default SigninScreen

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
    width: '100%', // Step 3 of 3
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
  },
  input: {
    fontSize: 18,
    color: '#000000',
    paddingVertical: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    color: '#d32f2f', // A dark red for errors in light theme
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
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
    minHeight: 58, // Ensure button height is consistent during loading
    justifyContent: 'center',
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