import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import useFetch from "../hooks/useFetch";
import { user,Boat } from "../types/UserType.types";
import useLocalStorage from "../hooks/AsyncStorage";
import { jwtDecode } from "jwt-decode";

type RootStackParamList = {
  Login: undefined;
  AccueilHome: {
    userName?: string;
    password?: string;
    boatList?: Boat[];
  };
};
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const tokenStorage = useLocalStorage<string>("authToken");
  const { POST, GET } = useFetch();
  const [nom, setNom] = useState("");
  const [password, setPassword] = useState("");
  const [boatListe, setBoatList] = useState<Boat[]>([]);
  //  Fonction pour récupérer le token stocké
  const tokenRecuperation = async (): Promise<string | null> => {
    console.log("Récupération du token stocké...");
    const getedToken = await tokenStorage.getItem();
    return getedToken;
  };
  //  Charger la liste de bateaux après connexion
  useEffect(() => {
    const fetchBoats = async () => {
      const token = await tokenRecuperation();
      if (!token) return;

      const listboats = await GET<Boat[]>("/ships", {
        Authorization: `Bearer ${token}`,
      });
      setBoatList(listboats || []);
    };
    fetchBoats();
  }, []);


  type TokenPayload = {
    email: string;
    isAdmin: boolean;
    exp?: number;
  };


  const handleLogin = async () => {
    console.log("🔐 Tentative de connexion...");
    if (!nom ||  !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }
    const newUser: user = {
      username: nom,
      password:password,
    };
    try {
      const response = await POST<user, { token: string }>("/auth/login", newUser);
      if (!response?.token) {
        Alert.alert("Erreur", "Token manquant dans la réponse du serveur.");
        return;
      }
      await tokenStorage.setItem(response.token);
      const decoded: TokenPayload = jwtDecode<TokenPayload>(response.token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter.");
        await tokenStorage.removeItem();
        return;
      }
    
      // 🚀 Navigation vers l'accueil
      navigation.navigate("AccueilHome", {
        userName: nom,
        password: password,
        boatList: boatListe,
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se connecter.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nom"
        style={styles.input}
        value={nom}
        testID="nomInput"
        onChangeText={setNom}
      />

      <TextInput
        placeholder="Mot de passe"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        testID="passwordInput"
        secureTextEntry
      />

      <Button title="Connexion" onPress={handleLogin} testID="submitButton" />

      <TouchableOpacity
        onPress={() => navigation.navigate("AccueilHome", { userName: nom })}
      >
        <Text style={styles.link}>Aller à la page d'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  link: {
    color: "blue",
    marginTop: 20,
    textAlign: "center",
  },
});
