
import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Boat } from "../types/UserType.types";

type Props = {
  selectedBoats: Boat[];
  ports: string[];
  handleNavigate:  (destination: string) => void;
  handleAddequipage: (crewSize: string) => void;
  handleDeleteEquipage: (crewSize: string) => void;
  handleAddTresor: (goldCargo: string) => void;
  handleDeleteTresor: (goldCargo: string) => void;
};

export default function PirateNormale({
  selectedBoats,
  ports,
  handleNavigate,
  handleAddequipage,
  handleDeleteEquipage,
  handleAddTresor,
  handleDeleteTresor
}: Props) {
  const [destination, setDestination] = useState("");
  const [nombreEquipage, setNombreEquipage] = useState("");
  const [nombreOr, setNombreOr] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actions Pirate Normal</Text>

      <Text>Ports disponibles :</Text>
      {ports.map((port) => (
        <Text key={port}>{port}</Text>
      ))}

      <TextInput
        placeholder="Port"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />
      <Button title="Naviguer" onPress={() => handleNavigate(destination)} />

      <Text>Ajouter ou retirer un membre de l'équipage</Text>
      <TextInput
        placeholder="Nombre d'équipage"
        value={nombreEquipage}
        onChangeText={setNombreEquipage}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="+" onPress={() => handleAddequipage(nombreEquipage)} />
      <Button title="-" onPress={() => handleDeleteEquipage(nombreEquipage)} />

      <Text>Ajouter ou retirer de l'or</Text>
      <TextInput
        placeholder="Nombre d'or"
        value={nombreOr}
        onChangeText={setNombreOr}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="+" onPress={() => handleAddTresor(nombreOr)} />
      <Button title="-" onPress={() => handleDeleteTresor(nombreOr)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
});
