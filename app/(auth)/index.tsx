import ErrorMessage from "@/components/ErrorMessage";
import { useAuth } from "@/hooks/useAuth";
import { login } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Clear previous error
    setError(null);

    // Validation
    if (!email.trim()) {
      setError("Por favor, introduce tu correo electrónico");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, introduce un correo electrónico válido");
      return;
    }

    if (!password) {
      setError("Por favor, introduce tu contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email.trim().toLowerCase(), password);
      await signIn(response.token, response.user);

      // Success animation before navigation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/");
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Por favor, revisa tus credenciales e inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (focused: boolean, hasError: boolean = false) => [
    styles.input,
    focused && styles.inputFocused,
    hasError && styles.inputError,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#2C2C2C" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Gradient Effect */}
          <View style={styles.backgroundGradient} />

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Image
                  source={{
                    uri: "/assets/images/icon.png",
                  }}
                  style={styles.logoImage}
                />
                <View style={styles.logoIconOverlay}>
                  <Ionicons name="checkmark-circle" size={24} color="#5BBA6F" />
                </View>
              </View>
              <Text style={styles.logoText}>AutoAttendance</Text>
              <Text style={styles.logoSubtext}>
                Control de Asistencia Inteligente
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <View style={styles.welcomeSection}>
                <Text style={styles.title}>Bienvenido de nuevo</Text>
                <Text style={styles.subtitle}>
                  Inicia sesión para continuar con tu jornada
                </Text>
              </View>

              {error && (
                <Animated.View style={styles.errorContainer}>
                  <ErrorMessage message={error} />
                </Animated.View>
              )}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="mail-outline" size={16} color="#5BBA6F" />{" "}
                  Correo electrónico
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={getInputStyle(
                      emailFocused,
                      error?.includes("correo")
                    )}
                    placeholder="tu.correo@empresa.com"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!isLoading}
                    accessibilityLabel="Campo de correo electrónico"
                    accessibilityHint="Introduce tu dirección de correo electrónico"
                  />
                  {email.length > 0 && validateEmail(email) && (
                    <View style={styles.inputIcon}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#5BBA6F"
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color="#5BBA6F"
                  />{" "}
                  Contraseña
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={passwordRef}
                    style={getInputStyle(
                      passwordFocused,
                      error?.includes("contraseña")
                    )}
                    placeholder="••••••••"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    editable={!isLoading}
                    accessibilityLabel="Campo de contraseña"
                    accessibilityHint="Introduce tu contraseña"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#666666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  isLoading && styles.buttonDisabled,
                  (!email || !password) && styles.buttonInactive,
                ]}
                onPress={handleLogin}
                disabled={isLoading || !email || !password}
                accessibilityLabel="Botón de iniciar sesión"
                accessibilityHint="Toca para iniciar sesión con tus credenciales"
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.loadingText}>Iniciando sesión...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Additional Options */}
              <View style={styles.additionalOptions}>
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C2C2C",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: "#131313",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logoWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#5BBA6F",
  },
  logoIconOverlay: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 14,
    color: "#5BBA6F",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  errorContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    color: "#131313",
    paddingRight: 50,
  },
  inputFocused: {
    borderColor: "#5BBA6F",
    backgroundColor: "#FFFFFF",
    shadowColor: "#5BBA6F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: "#DC3545",
    backgroundColor: "#FFF5F5",
  },
  inputIcon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: 18,
    padding: 4,
  },
  button: {
    backgroundColor: "#5BBA6F",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#5BBA6F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#A8D4B0",
    shadowOpacity: 0.1,
  },
  buttonInactive: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  additionalOptions: {
    marginTop: 24,
    alignItems: "center",
  },
  forgotPassword: {
    padding: 8,
  },
  forgotPasswordText: {
    color: "#5BBA6F",
    fontSize: 14,
    fontWeight: "500",
  },
});
