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
  Autresnavigations: { idBoat: string };
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
  useEffect(() => { 
    setSelectedBoats(boatList);
getPorts();
  }, []);

  const handleSubmit = async () => {
    if (!name || !goldCargo || !captain || !crewSize) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs du formulaire !");
      return;
    }

    try {
      const token = await getToken();
      const newBoat: BoatRequest = {
        name,
        goldCargo: parseInt(goldCargo, 10),
        captain,
        status,
        crewSize: parseInt(crewSize, 10),
      };
      await POST<BoatRequest>("/ships", newBoat, { Authorization: `Bearer ${token}` });
      Alert.alert("Succès", "Bateau ajouté avec succès !");
      setStateAddOrDeleteBoat(!stateAddOrDeleteBoat);
    } catch (error) {
      console.error("Erreur lors de l'ajout du bateau :", error);
    }
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

  // Récupérer les ports disponibles
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

const handleDeleteEquipage = async () => {
  const token = await getToken();

  const crewToRemove = Number(nombreEquipage); // convertir si c'est une string

  console.log("ID du bateau:", selectedBoats[0].id);
  console.log("Nombre d'équipage à retirer:", crewToRemove);
/*important de citer newcrew comem dans swagger Non, tu ne peux pas envoyer juste un nombre 
tout seul dans le body si ton backend attend un objet avec une clé spécifique. ⚠️*/
  await POST(
    `/ships/retirerEquipage/${selectedBoats[0].id}`,
    { newCrew: crewToRemove }, // <-- body correct
    { Authorization: `Bearer ${token}` } // <-- headers
  );
};

  
  const handleAddTresor = async () => {
  const token = await getToken();
  const quantiteOr = Number(nombreOr); // convertir si nécessaire

  console.log("ID du bateau:", selectedBoats[0].id);
  console.log("Quantité d'or à ajouter:", quantiteOr);

  await POST(
    `/ships/ajouterOr/${selectedBoats[0].id}`,
    { Or: quantiteOr }, // <-- body JSON correct
    { Authorization: `Bearer ${token}` } // <-- headers
  );
};

 const handleDeleteTresor = async () => {
  const token = await getToken();
  const quantiteOr = Number(nombreOr); // convertir si c'est une string

  console.log("ID du bateau:", selectedBoats[0].id);
  console.log("Quantité d'or à retirer:", quantiteOr);

  await POST(
    `/ships/retirerOr/${selectedBoats[0].id}`,
    { Or: quantiteOr }, // <-- body JSON correct
    { Authorization: `Bearer ${token}` } // <-- headers
  );
};

  const handleNavigate = () => {
    try {
      for (const Boat of selectedBoats) {
        navigateBoat(Boat.id);
      }
    } catch (error) {
      console.error("Erreur lors de la navigation des bateaux :", error);
    }
  };
const navigateBoat = async (idBoat: string) => {
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

const handleDeleteSelected = async () => {
  try {
    await Promise.all(selectedBoats.map((boat) => handleDelete(boat.id)));
    setSelectedBoats([]);
  } catch (error) {
    console.error("Erreur lors de la suppression des bateaux sélectionnés :", error);
  }
};


  const handleTransfer = async () => {
    if (!nombreOr || selectedBoats.length < 2) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }
    try {
      const token = await getToken();
      await POST(`/transferGold`, {
        amount: parseInt(nombreOr, 10),
        fromBoatId: selectedBoats[0],
        toBoatId: selectedBoats[1],
      }, { Authorization: `Bearer ${token}` });
      Alert.alert("Succès", `Transfert de ${nombreOr} or effectué !`);
      setIsTransfert(!isTransfert);
    } catch (error) {
      console.error("Erreur lors du transfert :", error);
    }
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
     {selectedBoats.length > 0 ? (
  <Text style={styles.subtext}>Nombre de bateaux : {boatListe.length}</Text>
) : (
  <Text style={styles.subtext}>Aucun bateau</Text>
)}

     

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

      {/* Partie pour un pirate normal */}
      {!isAdmin && selectedBoats.length > 0 && (
        <>
        <Text>Voici la liste des ports dispoinbles des utilisateurs </Text>
        {ports.map((port) => (
          <Text key={port}>{port}</Text>
        ))}
          <Text>Pour naviguer vers une destination, sélectionnez un bateau et appuyez sur "Naviguer"</Text>
          <TextInput
            placeholder="Port"
            value={destination}
            onChangeText={setDestination}
            style={styles.input}
            testID="portInput"
          />
          <Button title="Naviguer" onPress={handleNavigate} testID="buttonNaviguer" />

          <Text testID="equipageTitle">Ajouter ou retirer un membre de l'équipage</Text>
          <TextInput
            placeholder="Nombre d'équipage"
            value={nombreEquipage}
            onChangeText={setNombreEquipage}
            style={styles.input}
            keyboardType="numeric"
            testID="nombreEquipageInput"
          />
          <Button title="+" onPress={handleAddequipage} testID="buttonAddEquipage"  />
          <Button title="-" onPress={handleDeleteEquipage}  testID="buttonDeleteEquipage"/>

          <Text>Ajouter ou retirer de l'or</Text>
          <TextInput
            placeholder="Nombre d'or"
            value={nombreOr}
            onChangeText={setNombreOr}
            style={styles.input}
            keyboardType="numeric"
            testID="nombreOrInput"
          />
          <Button title="+" onPress={handleAddTresor} testID="buttonAddOr" />
          <Button title="-" onPress={handleDeleteTresor}  testID="buttonDeleteOr" />
        </>
      )}

      {/* Partie pour un amiral pirate */}
      {isAdmin && (
        <>
          <Text style={styles.title}>Formulaire Bateau</Text>
          <TextInput placeholder="Nom du bateau" value={name} onChangeText={setName} style={styles.input}     testID="NomduBateauAjoutInput" />
          <TextInput placeholder="Capitaine" value={captain} onChangeText={setCaptain} style={styles.input}         testID="CapitaineAjoutInput" />
          <TextInput
            placeholder="Or dans la cargaison"
            value={goldCargo}
            onChangeText={setGoldCargo}
            keyboardType="numeric"
            style={styles.input}
           testID="OrDansLaCargaisonInputAjout"
          />
          <TextInput
            placeholder="Taille de l'équipage"
            value={crewSize}
            onChangeText={setCrewSize}
            keyboardType="numeric"
            style={styles.input}
            testID="TailleDeLEquipageInputAjout"
          />
          <Text style={{ marginBottom: 5 }}>Statut :</Text>
          <Picker selectedValue={status} onValueChange={(value: Boat["status"]) => setStatus(value)} style={styles.input}   testID="StatusInput">
            <Picker.Item label="Docked" value="docked"  testID="DockedStatusOption"/>
            <Picker.Item label="Sailing" value="sailing"  testID="SailingStatusOption" />
            <Picker.Item label="Looking For A Fight" value="lookingForAFight"     testID="FightStatusOption"/>
          </Picker>
         <TouchableOpacity
  testID="buttonAjouterBateau"
  onPress={handleSubmit}
  style={{ padding: 10, backgroundColor: 'blue' }}
>
  <Text style={{ color: 'white' }}>Ajouter le bateau</Text>
</TouchableOpacity>
          <Text style={styles.title}>Transfert d'or entre bateaux</Text>
          <TextInput
            placeholder="Montant à transférer"
            value={nombreOr}
            onChangeText={setNombreOr}
            keyboardType="numeric"
            style={styles.input}
            testID="nombreOrInput"
          />
          <Button title="Transférer" onPress={handleTransfer} testID="buttonTransfererOr" />
            {isTransfert && (<Text testID="transfertMessage">Transfert réussie de {nombreTresor}</Text>) }
        </>
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
