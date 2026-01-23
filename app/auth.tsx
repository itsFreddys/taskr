import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const theme = useTheme();
  const styles = createStyles(theme);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Passwords must be at least 6 characters long.");
      return;
    }
    // is new account
    if (!isSignUp) {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        setError(null);
        console.log("passed auth sign in.");
        router.replace("/");
      }
      return;
    }

    if (!confirmPassword) {
      setError("Please Confirm Password.");
      return;
    }
    if (confirmPassword != password) {
      setError("Passwords do not match.");
      return;
    }
    const error = await signUp(email, password);
    if (error) {
      setError(error);
      return;
    }

    console.log("passed auth sign up.");
    setError(null);
    router.replace("/");
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>
        <TextInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          style={styles.input}
          onChangeText={setEmail}
        />
        <TextInput
          label="Password"
          autoCapitalize="none"
          secureTextEntry
          mode="outlined"
          style={styles.input}
          onChangeText={setPassword}
        />
        {isSignUp && (
          <TextInput
            label="Confirm Password"
            autoCapitalize="none"
            secureTextEntry
            mode="outlined"
            style={styles.input}
            onChangeText={setConfirmPassword}
          />
        )}

        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

        <Button style={styles.button} onPress={handleAuth} mode="contained">
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        <Button
          style={styles.button}
          mode="text"
          onPress={handleSwitchMode}
          icon={"login"}
        >
          {isSignUp
            ? "Already have an Account? Sign In"
            : "Don't have an Account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    // paddingHorizontal: 14,
    // alignItems: "center",
  },
  content: {
    flex: 1,
    // backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingHorizontal: 16,
    // alignItems: "center",
  },
  title: {
    // fontSize: 24,
    color: theme.colors.onSurface,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
