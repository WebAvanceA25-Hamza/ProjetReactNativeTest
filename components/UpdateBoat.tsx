import { RouteProp } from "@react-navigation/native";
import { Boat, BoatRequest, BoatRequestUpdate } from "../types/UserType.types";
import { Picker } from '@react-native-picker/picker';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import useFetch from "../hooks/useFetch";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useLocalStorage from "../hooks/AsyncStorage";
import { useState } from "react";

type RootStackParamList = {
  Login: undefined;
  AccueilHome: { userName?: string; boatList?: Boat[] };
  UpdateBoat: { boatid: string };
};

type UpdateBoatProps = NativeStackScreenProps<RootStackParamList, "UpdateBoat">;

export default function UpdateBoat({ route, navigation }: UpdateBoatProps) {
  const { boatid } = route.params; 
/*
Parce que React Navigation passe automatiquement deux props (route et navigation) à chaque écran.
 En utilisant NativeStackScreenProps, tu dis à TypeScript qu’il s’agit d’un écran de navigation,
 donc il sait comment typer ces props et évite les erreurs.*/
  const [name, setName] = useState("");
  const [goldCargo, setGoldCargo] = useState("");
  const [captain, setCaptain] = useState("");
  const [crewSize, setCrewSize] = useState("");
const tokenStorage = useLocalStorage<string>("authToken");
  const { PATCH } = useFetch();
const tokenRecuperation = async (): Promise<string | null> => {
  const getedToken = await tokenStorage.getItem();
  return getedToken;
};
  const handleSubmit = async () => {
    if (!name || !captain || !goldCargo || !crewSize) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    const goldCargoNum = parseInt(goldCargo, 10);
    const crewSizeNum = parseInt(crewSize, 10);

    if (isNaN(goldCargoNum) || isNaN(crewSizeNum)) {
      Alert.alert("Erreur", "Veuillez entrer des nombres valides pour l'or et l'équipage.");
      return;
    }

    const boatData: BoatRequestUpdate = {
      name: name.trim(),
      captain: captain.trim(),
      goldCargo: goldCargoNum,
      crewSize: crewSizeNum,
    };


    try {
      const token = await tokenRecuperation(); 
      if (!token) {
        Alert.alert("Erreur", "Token manquant.");
        return;
      }
      await PATCH<BoatRequestUpdate>(`/ships/${boatid}`, boatData, {
        Authorization: `Bearer ${token}`,
      });
      Alert.alert("Succès", "Bateau mis à jour !");
      navigation.goBack(); 
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le bateau.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
  <Text style={[styles.title, { marginTop: 30 }]}>Formulaire Bateau</Text>

  <TextInput
    placeholder="Nom du bateau"
    value={name}
    onChangeText={setName}
    style={styles.input}
    testID="NomduBateauInput"
  />
  <TextInput
    placeholder="Capitaine"
    value={captain}
    onChangeText={setCaptain}
    style={styles.input}
    testID="CapitaineInput"
  />
  <TextInput
    placeholder="Or dans la cargaison"
    value={goldCargo}
    onChangeText={setGoldCargo}
    keyboardType="numeric"
    style={styles.input}
     testID="OrDansLaCargaisonInput"
  />
  <TextInput
    placeholder="Taille de l'équipage"
    value={crewSize}
    onChangeText={setCrewSize}
    keyboardType="numeric"
    style={styles.input}
      testID="TailleDeLEquipageInput"
  />
 <Button 
        title="modifier le bateau" 
       onPress={() => handleSubmit()} 
       testID="buttonModifierBateau"
      />
</ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
