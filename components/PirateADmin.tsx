
import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import FormulaireAjouterBoat from "./FormulaireAjouterBoat";
import { Boat } from "../types/UserType.types";

type Props = {

handleSubmit: (
  name: string,
  captain: string,
  goldCargo: string,
  crewSize: string,
  status: Boat["status"]
) => void;

  handleTransfer: (amount: string) => void;
  isTransfert: boolean;
  nombreOr: string;
  setNombreOr: (val: string) => void;
};

export default function PirateAdmin({
  handleSubmit,
  handleTransfer,
  isTransfert,
  nombreOr,
  setNombreOr
}: Props) {
  // États pour le formulaire
  const [name, setName] = useState("");
  const [captain, setCaptain] = useState("");
  const [goldCargo, setGoldCargo] = useState("");
  const [crewSize, setCrewSize] = useState("");
const [status, setStatus] = useState<Boat["status"]>("docked")

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formulaire Bateau</Text>
      {/* Intégration du formulaire */}
      <FormulaireAjouterBoat
        name={name}
        setName={setName}
        captain={captain}
        setCaptain={setCaptain}
        goldCargo={goldCargo}
        setGoldCargo={setGoldCargo}
        crewSize={crewSize}
        setCrewSize={setCrewSize}
        status={status}
        setStatus={setStatus}
        handleSubmit={() => handleSubmit(name, captain, goldCargo, crewSize, status)}
      />

      <Text style={styles.title}>Transfert d'or entre bateaux</Text>
      <TextInput
        placeholder="Montant à transférer"
        value={nombreOr}
        onChangeText={setNombreOr}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Transférer" onPress={() => handleTransfer(nombreOr)} />
      {isTransfert && <Text>Transfert réussi !</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
});
