
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
//Fonctionnel 
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
  const [destination, setDestination] = useState<string>(""); // pour navigation
  const [nombreOr, setNombreOr] = useState<string>(""); // pour transfert
  const { POST, DELETE, GET } = useFetch();
  const tokenStorage = useLocalStorage<string>("authToken");
  const isFocused = useIsFocused();

  const getToken = async (): Promise<string | null> => await tokenStorage.getItem();

  /** ✅ Fonction pour recharger les bateaux */
  const refetchBoats = async () => {
    const token = await getToken();
    if (!token) return;
    const listboats = await GET<Boat[]>("/ships", { Authorization: `Bearer ${token}` });
    console.log("refetchBoats -> fetched boats:", listboats);
    // force a new array instance so React re-renders
    const normalized = listboats ? [...listboats] : [];
    setBoatListe(normalized);
    // update selectedBoats to point to the new objects from the refreshed list
    setSelectedBoats((prev) => (prev.length > 0 ? prev.map((sb) => normalized.find((b) => b.id === sb.id) || sb) : []));
    return normalized;
  };

  /** ✅ Fetch boats & ports */
  useEffect(() => {
    const fetchBoats = async () => {
      const token = await getToken();
      if (!token) return;

      try {
        const decoded = jwtDecodeModule.jwtDecode(token) as { isAdmin: boolean };
        console.log("🔑 Token décodé, isAdmin:", decoded.isAdmin);
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

  /** ✅ CRUD Actions */
  const handleSubmit = async (
    name: string,
    captain: string,
    goldCargo: string,
    crewSize: string,
    status: Boat["status"]
  ) => {
    const token = await getToken();
    if (!token) return;

    if (isNaN(parseInt(goldCargo)) || isNaN(parseInt(crewSize))) {
      Alert.alert("Erreur", "Veuillez entrer des valeurs numériques valides.");
      return;
    }

    const newBoat: BoatRequest = {
      name,
      captain,
      goldCargo: parseInt(goldCargo, 10),
      crewSize: parseInt(crewSize, 10),
      status,
    };

    await POST("/ships", newBoat, { Authorization: `Bearer ${token}` });
    setBoatListe((prev) => [...prev, { ...newBoat, id: Date.now().toString() } as Boat]);
    await refetchBoats(); // Recharger après ajout
  };

  const handleUpdate = (id: string) => navigation.navigate("UpdateBoat", { boatid: id });

  const handleDelete = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    await DELETE(`/ships/${id}`, { Authorization: `Bearer ${token}` });
    setBoatListe((prev) => prev.filter((b) => b.id !== id));
    await refetchBoats(); // Recharger après suppression
  };

  const handleDeleteSelected = async () => {
    await Promise.all(selectedBoats.map((b) => handleDelete(b.id)));
    setSelectedBoats([]);
  };

  const handleLogout = async () => {
    const response = await POST<user, { token: string }>("/logout", { username: userName, password });
    if (response?.token) await tokenStorage.removeItem();
    navigation.navigate("Login");
  };

  /** ✅ Sélection */
  const toggleSelectBoat = (id: string) => {
    setSelectedBoats((prev) => {
      const isSelected = prev.some((b) => b.id === id);
      return isSelected ? prev.filter((b) => b.id !== id) : [...prev, boatListe.find((b) => b.id === id)!];
    });
  };

  /** ✅ Actions Pirates */
  const handleAddequipage = async (crewSize: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;

    const crewToAdd = Number(crewSize);
    if (isNaN(crewToAdd) || crewToAdd <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide pour l'équipage.");
      return;
    }

    await POST(`/ships/ajouterEquipage/${selectedBoats[0].id}`, { newCrew: crewToAdd }, { Authorization: `Bearer ${token}` });
    await refetchBoats();
  };

  const handleDeleteEquipage = async (crewSize: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;

    const crewToRemove = Number(crewSize);
    if (isNaN(crewToRemove) || crewToRemove <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide pour l'équipage.");
      return;
    }

    await POST(`/ships/retirerEquipage/${selectedBoats[0].id}`, { newCrew: crewToRemove }, { Authorization: `Bearer ${token}` });
    await refetchBoats();
  };

  const handleAddTresor = async (goldCargo: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;

    const quantiteOr = Number(goldCargo);
    if (isNaN(quantiteOr) || quantiteOr <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide pour l'or.");
      return;
    }

    await POST(`/ships/ajouterOr/${selectedBoats[0].id}`, { Or: quantiteOr }, { Authorization: `Bearer ${token}` });
    await refetchBoats();
  };

  const handleDeleteTresor = async (goldCargo: string) => {
    const token = await getToken();
    if (!token || !selectedBoats[0]) return;

    const quantiteOr = Number(goldCargo);
    if (isNaN(quantiteOr) || quantiteOr <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide pour l'or.");
      return;
    }

    await POST(`/ships/retirerOr/${selectedBoats[0].id}`, { Or: quantiteOr }, { Authorization: `Bearer ${token}` });
    await refetchBoats();
  };

  const handleTransfer = async () => {
    if (!nombreOr || selectedBoats.length < 2) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }
    const fromBoat = selectedBoats[0];
    const toBoat = selectedBoats[1];
    const amount = parseInt(nombreOr, 10);

    try {
      const token = await getToken();
      if (!token) return;
      await POST(`/ships/transferGold/${fromBoat.id}/${toBoat.id}`, { amount }, { Authorization: `Bearer ${token}` });
      Alert.alert("Succès", `Transfert de ${amount} or effectué !`);
      setIsTransfert((prev) => !prev);
      await refetchBoats();
    } catch (error) {
      console.error("Erreur lors du transfert :", error);
      Alert.alert("Erreur", "Le transfert a échoué.");
    }
  };

  const handleNavigate = (destination:string) => {
    try {
      for (const Boat of selectedBoats) {
        navigateBoat(Boat.id,destination);
      }
    } catch (error) {
      console.error("Erreur lors de la navigation des bateaux :", error);
    }
  };
const navigateBoat = async (idBoat: string,destination:string) => {
  console.log("Navigation du bateau avec l'ID :", idBoat);
  console.log("je susi entree dans navigate boat");
    if (!idBoat) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    try {
      const token = await getToken();
        console.log("voici mon token ",token);
           console.log("arrive a mon ships/send");
  await POST(`/ships/send/${encodeURIComponent(destination)}`, 
  { id: idBoat },  // corps
  { Authorization: `Bearer ${token}` } // headers
);

      alert(`Bateau ${idBoat} envoyé vers ${destination} !`);
         navigation.goBack(); 
    } catch (error) {
      console.error("Erreur lors de l'envoi du bateau :", error);
      alert("Échec de l'envoi du bateau. Vérifiez la console pour plus d'infos.");
         navigation.goBack(); 
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bienvenue {userName} {isAdmin ? " vous êtes admin" : "vous êtes un pirate normale"} </Text>
      <Text style={styles.subtext}>{boatListe.length > 0 ? `Nombre de bateaux : ${boatListe.length}` : "Aucun bateau"}</Text>

      <TheBoat boats={boatListe} selectedBoats={selectedBoats} toggleSelectBoat={toggleSelectBoat} handleDelete={handleDelete} handleUpdate={handleUpdate} />

      {selectedBoats.length > 0 && <Button title={`Supprimer ${selectedBoats.length} bateau(x)`} onPress={handleDeleteSelected} />}
        {isAdmin}
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
