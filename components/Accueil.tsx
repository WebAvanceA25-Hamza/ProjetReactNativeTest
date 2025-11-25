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
  UpdateBoat: { boatid: string };
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
const getToken = async (): Promise<string | null> => await tokenStorage.getItem();
  type TokenPayload = {
    email: string;
    isAdmin: boolean;
    exp?: number;
  };
  useEffect(() => {
    const fetchBoats = async () => {
      const token = await getToken();
      //maniere pour ire le token de asyncstorage
if (token) {
  const decoded: TokenPayload = jwtDecode<TokenPayload>(token);
  setIsAdmin(decoded.isAdmin);
  console.log("🗝️ isAdmin :", decoded.isAdmin);
}
      const listboats = await GET<Boat[]>("/ships", { Authorization: `Bearer ${token}` });
      setBoatList(listboats || []);
      setSelectedBoats(listboats||[]); // Réinitialise la sélection après le rechargement
    };

    if (isFocused) fetchBoats();
    getPorts();
  }, [isFocused, stateAddOrDeleteBoat]);
  
const handleDeleteSelected = async () => {
  try {
    await Promise.all(selectedBoats.map((boat) => handleDelete(boat.id)));
    setSelectedBoats([]);
  } catch (error) {
    console.error("Erreur lors de la suppression des bateaux sélectionnés :", error);
  }
};
  const getPorts = async () => {
    try {
      const token = await getToken();
      const portsList = await GET<string[]>("/ships/send/userlist", {
        Authorization: `Bearer ${token}`,
      });
      setPorts(portsList || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des ports :", error);
    }
  };
const handleAddequipage = async () => {
  const token = await getToken();
  const crewToAdd = Number(nombreEquipage); // convertir en nombre si c'est une string

  await POST(
    `/ships/ajouterEquipage/${selectedBoats[0].id}`,
    { newCrew: crewToAdd }, // <-- body correct
    { Authorization: `Bearer ${token}` }
  );
};
  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      console.log("Suppression du bateau avec l'ID :", id);
      await DELETE(`/ships/${id}`, { Authorization: `Bearer ${token}` });
      Alert.alert("Succès", "Bateau supprimé avec succès !");
      setStateAddOrDeleteBoat(!stateAddOrDeleteBoat);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleUpdate = (id:string) => {
    navigation.navigate("UpdateBoat", { boatid: id });
  };

const toggleSelectBoat = (id: string) => {
  setSelectedBoats((prevSelectedBoats) => {
    const isSelected = prevSelectedBoats.some((boat) => boat.id === id);

    if (isSelected) {
      // Retire le bateau s'il était déjà sélectionné
      return prevSelectedBoats.filter((boat) => boat.id !== id);
    } else {
      // Ajoute le bateau correspondant à l'id sélectionné
      const boatToAdd = boatList.find((boat) => boat.id === id);
      return boatToAdd ? [...prevSelectedBoats, boatToAdd] : prevSelectedBoats;
    }
  });
};
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
{boatListe.map((boat) => (
        <View key={boat.id} style={styles.boatContainer}>
          <View style={styles.boatHeader}>
            <Text style={styles.subtext} testID={`boat-name-${boat.id}`}>{boat.name}</Text>
            <Checkbox
              status={selectedBoats.includes(boat) ? "checked" : "unchecked"}
              onPress={() => toggleSelectBoat(boat.id)}
               testID={`checkbox-${boat.name}`}
            />
          </View>
          <Text style={styles.subtext}>Statut: {boat.status}</Text>
          <Text style={styles.subtext}>Capitaine: {boat.captain}</Text>
          <Text style={styles.subtext}>Or: {boat.goldCargo}</Text>
          <Text style={styles.subtext}>Équipage: {boat.crewSize}</Text>
          <Button title="Supprimer" onPress={() => handleDelete(boat.id)} testID={`buttonSupprimer-${boat.name}`}/>
          <Button title="Modifier" onPress={()=>handleUpdate(boat.id)}  testID={`buttonModifier-${boat.name}`}/>
        </View>
      ))}

      {selectedBoats.length > 0 && (
        <Button
          title={`Supprimer ${selectedBoats.length} bateau(x) sélectionné(s)`}
          onPress={handleDeleteSelected}
          testID="buttonSupprimerSelection"
        />
      )}
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
