import React, { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import useFetch from "../hooks/useFetch";
import useLocalStorage from "../hooks/AsyncStorage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useNavigation, RouteProp } from "@react-navigation/native";

type NavigationScreenRouteProp = RouteProp<RootStackParamList, "Autresnavigations">;

type NavigationScreenProps = {
  route: NavigationScreenRouteProp;
};

export default function NavigationScreen({ route }: NavigationScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { idBoat } = route.params; // récupère le bateau depuis la route
  const [destination, setDestination] = useState("");
  const [ports, setPorts] = useState<string[]>([]);
  const tokenStorage = useLocalStorage<string>("authToken");

  const { POST, GET } = useFetch();

  // Récupération du token stocké
  const getToken = async (): Promise<string | null> => {
    const storedToken = await tokenStorage.getItem();
    return storedToken;
  };

  // Récupérer les ports disponibles
  const getPorts = async () => {
    try {
      const token = await getToken();
      const portsList = await GET<string[]>("/getAvailablePorts", {
        Authorization: `Bearer ${token}`,
      });
      setPorts(portsList || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des ports :", error);
    }
  };

  // Envoyer le bateau vers une destination
  const handleSubmit = async () => {
    if (!idBoat || !destination) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    try {
      const token = await getToken();
      await POST(`/sailToPort/${encodeURIComponent(idBoat)}/${encodeURIComponent(destination)}`, {}, {
        Authorization: `Bearer ${token}`,
      });
      alert(`Bateau ${idBoat} envoyé vers ${destination} !`);
         navigation.goBack(); 
    } catch (error) {
      console.error("Erreur lors de l'envoi du bateau :", error);
      alert("Échec de l'envoi du bateau. Vérifiez la console pour plus d'infos.");
         navigation.goBack(); 
    }
  };

  useEffect(() => {
    getPorts();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Liste des ports disponibles</Text>
      {ports.length > 0 ? (
        ports.map((port) => <Text key={port} style={styles.subtext}>{port}</Text>)
      ) : (
        <Text style={styles.subtext}>Aucun port disponible.</Text>
      )}

      <Text style={[styles.title, { marginTop: 20 }]}>Envoyer un bateau vers une destination</Text>

      <TextInput
        placeholder="ID du bateau"
        value={idBoat}
        editable={false} // Le champ est rempli depuis la route, pas modifiable
        style={styles.input}
      />
      <TextInput
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />

      <Button title="Envoyer le bateau" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1e3a8a",
    textAlign: "center",
  },
  subtext: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
});
