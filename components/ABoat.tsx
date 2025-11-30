
import { View, Text, Button, StyleSheet } from "react-native";
import { Checkbox } from "react-native-paper";
import { Boat } from "../types/UserType.types";

type Props = {
  boat: Boat;
  isSelected: boolean;
  toggleSelectBoat: (id: string) => void;
  handleDelete: (id: string) => void;
  handleUpdate: (id: string) => void;
};

export default function ABoat({ boat, isSelected, toggleSelectBoat, handleDelete, handleUpdate }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{boat.name}</Text>
        <Checkbox status={isSelected ? "checked" : "unchecked"} onPress={() => toggleSelectBoat(boat.id)} />
      </View>
      <Text>Statut: {boat.status}</Text>
      <Text>Capitaine: {boat.captain}</Text>
      <Text>Or: {boat.goldCargo}</Text>
      <Text>Équipage: {boat.crewSize}</Text>
      <Text>Pillage: {boat.timesPillaged}</Text>
      <Button title="Supprimer" onPress={() => handleDelete(boat.id)} />
      <Button title="Modifier" onPress={() => handleUpdate(boat.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "bold", fontSize: 16 },
});
