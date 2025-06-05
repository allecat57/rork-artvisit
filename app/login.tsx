import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore, TEST_USER } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react-native";
import Button from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Analytics from "@/utils/analytics";

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup, error, clearError, isLoading } = useAuthStore();
  const { ensureDefaultSubscription } = useProfileStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  // Check AsyncStorage for profile data
  useEffect(() => {
    const checkProfileData = async () => {
      try {
        const profileData = await AsyncStorage.getItem("profile-storage");
        if (profileData) {
          console.log("Login screen: Found profile data in AsyncStorage");
        } else {
          console.log("Login screen: No profile data found in AsyncStorage");
        }
      } catch (err) {
        console.error("Error checking profile data in login screen:", err);
      }
    };

    checkProfileData();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const authData = await AsyncStorage.getItem("auth-storage");
        if (authData) {
          const parsedData = JSON.parse(authData);
          if (parsedData.state && parsedData.state.isAuthenticated) {
            console.log("User already logged in, redirecting to tabs");
            router.replace("/(tabs)");
          }
        }
      } catch (err) {
        console.error("Error checking login status:", err);
      }
    };
    
    checkLoginStatus();
  }, [router]);

  // Clear any auth errors when component mounts or when switching between login/signup
  useEffect(() => {
    if (clearError) {
      clearError();
    }
    setFormErrors({});
  }, [isLogin, clearError]);

  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
      name?: string;
    } = {};

    // Email validation
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Name validation (only for signup)
    if (!isLogin && !name) {
      errors.name = "Name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let success;

      if (isLogin) {
        success = await login(email, password);

        // Log analytics event
        Analytics.logEvent(Analytics.Events.LOGIN, {
          method: "email",
          success: success
        });
      } else {
        success = await signup(email, name, password);

        // Log analytics event
        Analytics.logEvent(Analytics.Events.SIGNUP, {
          method: "email",
          success: success
        });
      }

      if (success) {
        // Ensure default subscription after login/signup
        ensureDefaultSubscription();

        router.replace("/(tabs)");
      }
    } catch (err) {
      // Error is already set in the auth store
      console.error("Authentication error:", err);

      // Log analytics event for failure
      Analytics.logEvent(isLogin ? Analytics.Events.LOGIN : Analytics.Events.SIGNUP, {
        method: "email",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  };

  const handleUseTestAccount = async () => {
    try {
      setEmail(TEST_USER.email);
      setPassword("password");

      // Wait a moment to show the filled fields before submitting
      setTimeout(async () => {
        await login(TEST_USER.email, "password");

        // Log analytics event
        Analytics.logEvent(Analytics.Events.LOGIN, {
          method: "test_account",
          success: true
        });

        // Ensure default subscription after login
        ensureDefaultSubscription();

        router.replace("/(tabs)");
      }, 500);
    } catch (err) {
      console.error("Error using test account:", err);
      Alert.alert(
        "Test Account Error",
        "There was a problem logging in with the test account. Please try again or use a different account."
      );

      // Log analytics event for failure
      Analytics.logEvent(Analytics.Events.LOGIN, {
        method: "test_account",
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section with TimeFrame & Tagline */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TimeFrame</Text>
          <Text style={styles.tagline}>Art At Your Fingertips</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to continue your art journey"
              : "Join our community of art enthusiasts"}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {!isLogin && (
            <View style={styles.inputContainer}>
              <User
                size={20}
                color={formErrors.name ? colors.status.error : "#AC8901"}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  formErrors.name ? styles.inputError : null,
                ]}
                placeholder="Full Name"
                placeholderTextColor="#AC8901"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              {formErrors.name && (
                <Text style={styles.fieldErrorText}>{formErrors.name}</Text>
              )}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Mail
              size={20}
              color={formErrors.email ? colors.status.error : "#AC8901"}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                formErrors.email ? styles.inputError : null,
              ]}
              placeholder="Email Address"
              placeholderTextColor="#AC8901"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formErrors.email && (
              <Text style={styles.fieldErrorText}>{formErrors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Lock
              size={20}
              color={formErrors.password ? colors.status.error : "#AC8901"}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                formErrors.password ? styles.inputError : null,
              ]}
              placeholder="Password"
              placeholderTextColor="#AC8901"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#AC8901" />
              ) : (
                <Eye size={20} color="#AC8901" />
              )}
            </TouchableOpacity>
            {formErrors.password && (
              <Text style={styles.fieldErrorText}>{formErrors.password}</Text>
            )}
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <Button
            title={isLogin ? "Sign In" : "Create Account"}
            onPress={handleSubmit}
            variant="primary"
            loading={isLoading}
            style={styles.submitButton}
            analyticsEventName={isLogin ? "login_attempt" : "signup_attempt"}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Use Test Account"
            onPress={handleUseTestAccount}
            variant="outline"
            style={styles.testAccountButton}
            analyticsEventName="use_test_account"
            textStyle={{ color: "#AC8901" }}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchActionText}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logoText: {
    ...typography.heading1,
    color: "#AC8901",
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "Georgia, serif"
    }),
  },
  tagline: {
    ...typography.body,
    color: "#AC8901",
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  title: {
    ...typography.heading2,
    marginBottom: 8,
    color: "#AC8901",
  },
  subtitle: {
    ...typography.body,
    color: "#AC8901",
    marginBottom: 32,
  },
  errorText: {
    ...typography.body,
    color: colors.status.error,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(255, 0, 0, 0.05)",
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.primary.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingLeft: 48,
    paddingRight: 16,
    color: "#AC8901",
    borderWidth: 1,
    borderColor: "#AC8901",
  },
  inputError: {
    borderColor: colors.status.error,
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 14,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  fieldErrorText: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: "#AC8901",
  },
  submitButton: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#AC8901",
  },
  dividerText: {
    ...typography.bodySmall,
    color: "#AC8901",
    marginHorizontal: 8,
  },
  testAccountButton: {
    marginBottom: 32,
    borderColor: "#AC8901",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  switchText: {
    ...typography.body,
    color: "#AC8901",
  },
  switchActionText: {
    ...typography.body,
    color: "#AC8901",
    fontWeight: "600",
    marginLeft: 8,
  },
});