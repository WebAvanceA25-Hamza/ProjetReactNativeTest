
import { View, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Boat } from "../types/UserType.types";

type Props = {
  name: string;
  setName: (val: string) => void;
  captain: string;
  setCaptain: (val: string) => void;
  goldCargo: string;
  setGoldCargo: (val: string) => void;
  crewSize: string;
  setCrewSize: (val: string) => void;
  status: Boat["status"];
  setStatus: (val: Boat["status"]) => void;
  handleSubmit: () => void;
};

export default function FormulaireAjouterBoat({
  name,
  setName,
  captain,
  setCaptain,
  goldCargo,
  setGoldCargo,
  crewSize,
  setCrewSize,
  status,
  setStatus,
  handleSubmit,
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nom du bateau"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Capitaine"
        value={captain}
        onChangeText={setCaptain}
        style={styles.input}
      />
      <TextInput
        placeholder="Or dans la cargaison"
        value={goldCargo}
        onChangeText={setGoldCargo}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Taille de l'équipage"
        value={crewSize}
        onChangeText={setCrewSize}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* ✅ Picker pour le statut */}
      <Picker
        selectedValue={status}
        onValueChange={(itemValue) => setStatus(itemValue as Boat["status"])}
        style={styles.input}
      >
        <Picker.Item label="docked" value="docked" />
        <Picker.Item label="sailing" value="sailing" />
        <Picker.Item label="lookingForAFight" value="lookingForAFight" />
      </Picker>

      <Button title="Ajouter le bateau" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
