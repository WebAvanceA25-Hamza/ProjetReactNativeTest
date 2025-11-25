import React, { use, useEffect, useState } from "react";
import { Checkbox } from 'react-native-paper';
import { RouteProp } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useFetch from "../hooks/useFetch";
import useLocalStorage from "../hooks/AsyncStorage";
import { Boat, BoatRequest, user } from "../types/UserType.types"; // corrige l'import selon ton fichier
import { jwtDecode } from "jwt-decode";
type RootStackParamList = {
  Login: undefined;
  AccueilHome: {
    userName?: string;
    password?: string;
    boatList?: Boat[];
  };

};

type AccueilRouteProp = RouteProp<RootStackParamList, "AccueilHome">;

export default function Accueil({ route }: { route: AccueilRouteProp }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userName = "", password = "", boatList = [] } = route.params || {};

  const [name, setName] = useState("");
  const [goldCargo, setGoldCargo] = useState("");
  const [captain, setCaptain] = useState("");
  const [status, setStatus] = useState<Boat["status"]>("docked");
  const [crewSize, setCrewSize] = useState("");
  const [boatListe, setBoatList] = useState<Boat[]>(boatList || []);
  const [stateAddOrDeleteBoat, setStateAddOrDeleteBoat] = useState(false);
  const [selectedBoats, setSelectedBoats] = useState<Boat[]>([]);
  const [destination, setDestination] = useState("");
  const [nombreEquipage, setNombreEquipage] = useState<string>("");
  const [nombreTresor, setNombreTresor] = useState<string>("");
  const [nombreOr, setNombreOr] = useState<string>("");
  const [ports, setPorts] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // pour gérer les droits admin
    const [isTransfert, setIsTransfert] = useState<boolean>(false); // pour gérer les droits admin

  const { POST, DELETE, GET } = useFetch();
  const tokenStorage = useLocalStorage<string>("authToken");
  const isFocused = useIsFocused();




  const handleLogout = async () => {
    try {
      const response = await POST<user, { token: string }>("/logout", { username: userName, password });
      if (response?.token) await tokenStorage.removeItem();
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erreur logout :", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} testID="accueilHomeTitle">Bienvenue {userName} 🎉</Text>

      <Button title="Se déconnecter" onPress={handleLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f8ff",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#1e3a8a" },
  subtext: { fontSize: 16, color: "#555", marginBottom: 5 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  boatContainer: { marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 8, width: "100%" },
  boatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
