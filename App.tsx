/*
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleLogin = () => {
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      {!submitted ? (
        <>
          <Text style={styles.title}>Connexion</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="emailInput"   // 👈 Maestro s'en sert
            style={styles.input}
          />
          <Button
            title="Se connecter"
            accessibilityLabel="submitButton" // 👈 Maestro s'en sert
            onPress={handleLogin}
          />
        </>
      ) : (
        <Text accessibilityLabel="welcomeText">
          Bienvenue {email}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});
*/
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleLogin = () => {
    setSubmitted(true);
  };

  const handleLogout = () => {
    setSubmitted(false);
    setEmail(""); // Optionnel : réinitialiser l'email
  };

  return (
    <View style={styles.container}>
      {!submitted ? (
        <>
          <Text style={styles.title}>Connexion</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="emailInput"
            style={styles.input}
          />
          <Button
            title="Se connecter"
            accessibilityLabel="submitButton"
            onPress={handleLogin}
          />
        </>
      ) : (
        <>
          <Text accessibilityLabel="welcomeText">
            Bienvenue {email}
          </Text>
          <Button
            title="Déconnexion"
            accessibilityLabel="logoutButton" // 👈 utile pour Maestro
            onPress={handleLogout}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});

