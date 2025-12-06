import { useEffect, useState } from "react";
import { ScrollView, Text, Button, StyleSheet, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import useFetch from "../hooks/useFetch";
import useLocalStorage from "../hooks/AsyncStorage";
import TheBoat from "./TheBoat";
import PirateNormale from "./PirateNormale";
import PirateAdmin from "./PirateADmin";
import { Boat, BoatRequest, user } from "../types/UserType.types";
import * as jwtDecodeModule from "jwt-decode";

type RootStackParamList = {
  Login: undefined;
  AccueilHome: { userName?: string; password?: string; boatList?: Boat[] };
  UpdateBoat: { boatid: string };
};

export default function Accueil({ route }: { route: { params?: RootStackParamList["AccueilHome"] } }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userName = "", password = "", boatList = [] } = route.params || {};

  const [boatListe, setBoatListe] = useState<Boat[]>(boatList || []);
  const [selectedBoats, setSelectedBoats] = useState<Boat[]>([]);
  const [ports, setPorts] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isTransfert, setIsTransfert] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>("");
  const [nombreOr, setNombreOr] = useState<string>("");

  const { POST, DELETE, GET } = useFetch();
  const tokenStorage = useLocalStorage<string>("authToken");
  const isFocused = useIsFocused();

  const getToken = async (): Promise<string | null> => await tokenStorage.getItem();

  const refetchBoats = async () => {
    const token = await getToken();
    if (!token) return;

    const listboats = await GET<Boat[]>("/ships", { Authorization: `Bearer ${token}` });
    const normalizedBoats = listboats ? [...listboats] : [];
    setBoatListe(normalizedBoats);

    setSelectedBoats(previousSelectedBoats =>
      previousSelectedBoats.length > 0
        ? previousSelectedBoats.map(selectedBoat =>
            normalizedBoats.find(boat => boat.id === selectedBoat.id) || selectedBoat
          )
        : []
    );

    return normalizedBoats;
  };

  useEffect(() => {
    const fetchBoats = async () => {
      const token = await getToken();
      if (!token) return;

      try {
        const decoded = jwtDecodeModule.jwtDecode(token) as { isAdmin: boolean };
        setIsAdmin(decoded.isAdmin);
      } catch (err) {
        console.error("Erreur décodage token:", err);
        return;
      }

      const listboats = await GET<Boat[]>("/ships", { Authorization: `Bearer ${token}` });
      setBoatListe(listboats || []);
    };

    const fetchPorts = async () => {
      const token = await getToken();
      if (!token) return;

      const portsList = await GET<string[]>("/ships/send/userlist", { Authorization: `Bearer ${token}` });
      setPorts(portsList || []);
    };

    if (isFocused) {
      fetchBoats();
      fetchPorts();
    }
  }, [isFocused]);

const handleSubmit = async (
  name: string,
  captain: string,
  goldCargo: string,
  crewSize: string,
  status: Boat["status"]
) => {
  const token = await getToken();
  if (!token) {
    Alert.alert("Erreur", "Token manquant. Veuillez vous reconnecter.");
    return;
  }

  if (!name || !captain || !goldCargo || !crewSize) {
    Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    return;
  }

if (
  isNaN(Number(goldCargo)) ||
  isNaN(Number(crewSize)) ||
  Number(goldCargo) < 0 ||
  Number(crewSize) < 0
) {
  Alert.alert("Erreur", "Veuillez entrer des nombres valides et non négatifs.");
  return;
}

  const newBoat: BoatRequest = {
    name,
    captain,
    goldCargo: Number(goldCargo),
    crewSize: Number(crewSize),
    status,
  };

  try {
    await POST("/ships", newBoat, { Authorization: `Bearer ${token}` });

    Alert.alert("Succès", "Bateau créé avec succès.");

    setBoatListe((previousBoats) => [
      ...previousBoats,
      { ...newBoat, id: Date.now().toString() } as Boat, // OK si ton API ne renvoie pas d'ID
    ]);

    await refetchBoats();
  } catch (error) {
    console.error("Erreur lors de l'ajout du bateau :", error);
    Alert.alert(
      "Erreur",
      "Impossible de créer le bateau pour le moment. Réessayez plus tard."
    );
  }
};


  const handleUpdate = (id: string) => navigation.navigate("UpdateBoat", { boatid: id });

  const handleDelete = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    try {
      await DELETE(`/ships/${id}`, { Authorization: `Bearer ${token}` });

      setBoatListe(previousBoats => previousBoats.filter(boat => boat.id !== id));

      await refetchBoats();
    } catch (error) {
      Alert.alert("Erreur de suppression", "Échec de la suppression du bateau. Veuillez réessayer.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBoats.length === 0) return;
    try {
      await Promise.all(selectedBoats.map(selectedBoat => handleDelete(selectedBoat.id)));
      setSelectedBoats([]);
    } catch (error) {
      Alert.alert("Erreur Multiple", "Une erreur est survenue lors de la suppression d'au moins un bateau.");
    }
  };

  const handleLogout = async () => {
    const response = await POST<user, { token: string }>("/logout", { username: userName, password });
    if (response?.token) await tokenStorage.removeItem();
    navigation.navigate("Login");
  };

  const toggleSelectBoat = (id: string) => {
    setSelectedBoats(previousSelectedBoats => {
      const alreadySelected = previousSelectedBoats.some(selectedBoat => selectedBoat.id === id);
      return alreadySelected
        ? previousSelectedBoats.filter(selectedBoat => selectedBoat.id !== id)
        : [...previousSelectedBoats, boatListe.find(boat => boat.id === id)!];
    });
  };

  const handleAddequipage = async (crewSize: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;

    const crewToAdd = Number(crewSize);
    if (crewToAdd <= 0 || isNaN(crewToAdd)) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide pour l'équipage.");
      return;
    }

    try {
      await POST(`/ships/ajouterEquipage/${selectedBoats[0].id}`, { newCrew: crewToAdd }, { Authorization: `Bearer ${token}` });
      await refetchBoats();
    } catch {
      Alert.alert("Erreur", "Échec de l'ajout d'équipage.");
    }
  };

  const handleDeleteEquipage = async (crewSize: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;
    const crewToRemove = Number(crewSize);
    if (crewToRemove <= 0 || isNaN(crewToRemove)) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide pour l'équipage.");
      return;
    }
    try {
      await POST(`/ships/retirerEquipage/${selectedBoats[0].id}`, { newCrew: crewToRemove }, { Authorization: `Bearer ${token}` });
      await refetchBoats();
    } catch {
      Alert.alert("Erreur", "Échec du retrait d'équipage.");
    }
  };

  const handleAddTresor = async (goldCargo: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;
    const amountOfGold = Number(goldCargo);
    if (amountOfGold <= 0 || isNaN(amountOfGold)) {
      Alert.alert("Erreur", "Veuillez entrer une quantité d'or valide.");
      return;
    }
    try {
      await POST(`/ships/ajouterOr/${selectedBoats[0].id}`, { Or: amountOfGold }, { Authorization: `Bearer ${token}` });
      await refetchBoats();
    } catch {
      Alert.alert("Erreur", "Échec de l'ajout de trésor.");
    }
  };

  const handleDeleteTresor = async (goldCargo: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;
    const amountOfGold = Number(goldCargo);
    if (amountOfGold <= 0 || isNaN(amountOfGold)) {
      Alert.alert("Erreur", "Veuillez entrer une quantité d'or valide.");
      return;
    }
    try {
      await POST(`/ships/retirerOr/${selectedBoats[0].id}`, { Or: amountOfGold }, { Authorization: `Bearer ${token}` });
      await refetchBoats();
    } catch {
      Alert.alert("Erreur", "Échec du retrait de trésor.");
    }
  };

  const handleTransfer = async () => {
    if (!nombreOr || selectedBoats.length < 2) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    const fromBoat = selectedBoats[0];
    const toBoat = selectedBoats[1];
    const amount = Number(nombreOr);

    try {
      const token = await getToken();
      if (!token) return;

      await POST(`/ships/transferGold/${fromBoat.id}/${toBoat.id}`, { amount }, { Authorization: `Bearer ${token}` });

      Alert.alert("Succès", `Transfert de ${amount} or effectué !`);
      setIsTransfert(previous => !previous);
      await refetchBoats();
    } catch {
      Alert.alert("Erreur", "Le transfert a échoué.");
    }
  };

  const handleNavigate = (destination: string) => {
    try {
      for (const boat of selectedBoats) {
        navigateBoat(boat.id, destination);
      }
    } catch (error) {
      console.error("Erreur lors de la navigation des bateaux :", error);
    }
  };

  const navigateBoat = async (idBoat: string, destination: string) => {
  if (!idBoat || !destination) {
    Alert.alert("Erreur", "Veuillez remplir tous les champs !");
    return;
  }

if (!ports.includes(destination)) {
  Alert.alert("Erreur", "Port introuvable !");
  return;
}


  try {
    const token = await getToken();

    await POST(
      `/ships/send/${encodeURIComponent(destination)}`,
      { id: idBoat },
      { Authorization: `Bearer ${token}` }
    );

    Alert.alert("Succès", `Bateau ${idBoat} envoyé vers ${destination} !`);
    navigation.goBack();
  } catch {
    Alert.alert("Erreur", "Échec de l'envoi du bateau.");
    navigation.goBack();
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text   testID="accueilHomeTitle" style={styles.title} >
        Bienvenue {userName} {isAdmin ? "vous êtes admin" : "vous êtes un pirate normal"}
      </Text>

      <Text style={styles.subtext}>
        {boatListe.length > 0 ? `Nombre de bateaux : ${boatListe.length}` : "Aucun bateau"}
      </Text>

      <TheBoat
        boats={boatListe}
        selectedBoats={selectedBoats}
        toggleSelectBoat={toggleSelectBoat}
        handleDelete={handleDelete}
        handleUpdate={handleUpdate}
      />

      {selectedBoats.length > 0 && (
        <Button title={`Supprimer ${selectedBoats.length} bateau(x)`} onPress={handleDeleteSelected} />
      )}

      {!isAdmin && selectedBoats.length > 0 && (
        <PirateNormale
          selectedBoats={selectedBoats}
          ports={ports}
          handleNavigate={handleNavigate}
          handleAddequipage={handleAddequipage}
          handleDeleteEquipage={handleDeleteEquipage}
          handleAddTresor={handleAddTresor}
          handleDeleteTresor={handleDeleteTresor}
        />
      )}

      {isAdmin && (
        <PirateAdmin
          handleSubmit={handleSubmit}
          handleTransfer={handleTransfer}
          isTransfert={isTransfert}
          nombreOr={nombreOr}
          setNombreOr={setNombreOr}
        />
      )}

      <Button title="Se déconnecter" onPress={handleLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f0f8ff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#1e3a8a" },
  subtext: { fontSize: 16, color: "#555", marginBottom: 5 },
});
