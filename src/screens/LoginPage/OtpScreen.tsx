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
    ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Import your custom hooks and constants ---
import { useAuth } from "../../context/AuthContext";
import { LOGGED_IN_KEY, USER_ID_KEY, USER_NAME_KEY } from "../../utils/constants";
import { supabase } from "../../utils/superbase";
import { LoginPageParams } from "../../navigation/StackNavigator";

// Define the type for the navigation route parameters
type OtpScreenRouteProp = RouteProp<LoginPageParams, "OtpScreen">;

const { width, height } = Dimensions.get("window");

const OtpScreen = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigation = useNavigation();
    const route = useRoute<OtpScreenRouteProp>();
    const { email } = route.params; // Get the email passed from the previous screen

    // Extract name and phone if they exist in route params
    const name = "name" in route.params ? route.params.name : undefined;
    const phone = "phone" in route.params ? route.params.phone : undefined;
    const isSignup = name !== undefined && phone !== undefined;
    
    const { setLoggedIn } = useAuth(); // Access the global state updater

    const isOtpValid = otp.trim().length === 6;

    const signin = async (): Promise<void> => {
        try {
            const {
                data: { session },
                error: verifyError,
            } = await supabase.auth.verifyOtp({
                email: email,
                token: otp.trim(),
                type: "email",
            });

            if (verifyError) {
                throw verifyError;
            }

            if (!session) {
                throw new Error("Verification failed. Please try again.");
            }

            // --- SUCCESS: OTP is correct, user is logged in ---
            console.log("OTP verification successful, session created.");

            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) {
                    console.log("user does not exist");
                    return;
                }
                await AsyncStorage.setItem(USER_ID_KEY, user.id);
                console.log(user.id);
            } catch (error) {
                console.log("could not save user id");
            }

            await AsyncStorage.setItem(LOGGED_IN_KEY, "true");
            setLoggedIn(true); // Update the global state to trigger navigation to the main app
        } catch (err: any) {
            console.error("Error during OTP verification:", err);
            setError(err.message || "Invalid or expired OTP.");
        }
    };

    const signup = async (): Promise<void> => {
        try {
            const {
                data: { session },
                error: verifyError,
            } = await supabase.auth.verifyOtp({
                email: email,
                token: otp.trim(),
                type: "email",
            });

            if (verifyError) {
                throw verifyError;
            }

            if (!session) {
                throw new Error("Verification failed. Please try again.");
            }

            // --- SUCCESS: OTP is correct, user is logged in ---
            console.log("OTP verification successful for signup, session created.");

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                console.log("user does not exist");
                return;
            }

            try {
                await AsyncStorage.setItem(USER_ID_KEY, user.id);
                console.log("User ID saved:", user.id);
            } catch (error) {
                console.log("could not save user id:", error);
            }

            // Insert user data into the users table
            try {
                const { error: insertError } = await supabase.from("users").insert({
                    id: user.id,
                    email: user.email,
                    name: name,
                    phone: phone, // Use phone from params or user object
                });

                if (insertError) {
                    console.error("Error inserting user data:", insertError);
                    return
                }
            } catch (error) {
                console.error("Error during user data insertion:", error);
                return
            }

            await AsyncStorage.setItem(LOGGED_IN_KEY, "true");
            setLoggedIn(true); // Update the global state to trigger navigation to the main app
        } catch (err: any) {
            console.error("Error during signup OTP verification:", err);
            setError(err.message || "Invalid or expired OTP.");
        }
    };

    const handleVerify = async () => {
        if (!isOtpValid) {
            setError("Please enter a 6-digit code.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('the second',isSignup)
            if (isSignup === true) {

                console.log('this is a signup')
                await signup();
                
            } else {
                console.log('this is a signin')
                await signin();
            }
        } catch (error) {
            console.error("Unexpected error during verification:", error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Updated Status Bar for light theme */}
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            {/* Reverted to the original light theme gradient */}
            <LinearGradient
                colors={["#ffffff", "#f8f9fa", "#f1f3f4"]}
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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.content}>
                    <View style={styles.headerSection}>
                        {/* Added a progress bar to maintain consistency */}
                        <View style={styles.progressBar}>
                            <View style={styles.progressFill} />
                        </View>
                        <View style={{ height: 30 }}></View>
                        <Text style={styles.title}>Enter Code</Text>
                        <Text style={styles.subtitle}>
                            We sent a verification code to{"\n"}
                            <Text style={{ fontWeight: "bold", color: "#000" }}>{email}</Text>
                        </Text>
                    </View>

                    <View style={styles.inputSection}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter OTP"
                                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                value={otp}
                                onChangeText={(text) => {
                                    setOtp(text);
                                    if (error) setError(null);
                                }}
                                autoFocus={true}
                                keyboardType="number-pad"
                                maxLength={6}
                                returnKeyType="done"
                                onSubmitEditing={handleVerify}
                            />
                        </View>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>

                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                { opacity: isOtpValid && !loading ? 1 : 0.5 },
                            ]}
                            onPress={handleVerify}
                            disabled={!isOtpValid || loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.continueButtonText}>Verify</Text>
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
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff", // Set background color here for the safe area
    },
    gradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 1,
    },
    floatingElements: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    floatingCircle: {
        position: "absolute",
        backgroundColor: "rgba(0, 0, 0, 0.03)",
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
        alignItems: "center",
        paddingTop: 40,
    },
    progressBar: {
        width: 80,
        height: 4,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
        marginBottom: 16,
        overflow: "hidden",
    },
    progressFill: {
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        borderRadius: 2,
    },
    stepText: {
        fontSize: 14,
        color: "rgba(0, 0, 0, 0.6)",
        marginBottom: 24,
        fontWeight: "500",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#000000",
        textAlign: "center",
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(0, 0, 0, 0.6)",
        textAlign: "center",
        lineHeight: 24,
        fontWeight: "400",
        paddingHorizontal: 20,
    },
    inputSection: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    inputContainer: {
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.1)",
        paddingHorizontal: 20,
        paddingVertical: 4,
    },
    input: {
        fontSize: 24,
        color: "#000000",
        paddingVertical: 16,
        fontWeight: "600",
        textAlign: "center",
        letterSpacing: 10,
    },
    errorText: {
        color: "#D32F2F", // A clear, but not harsh red
        marginTop: 12,
        textAlign: "center",
        fontWeight: "500",
    },
    actionSection: {
        gap: 16,
        paddingBottom: 20,
    },
    continueButton: {
        backgroundColor: "#000000",
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        minHeight: 58,
        justifyContent: "center",
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        letterSpacing: -0.2,
    },
    skipButton: {
        backgroundColor: "transparent",
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: "center",
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "rgba(0, 0, 0, 0.6)",
        letterSpacing: -0.1,
    },
});