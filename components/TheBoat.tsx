
import { View } from "react-native";
import ABoat from "./ABoat";
import { Boat } from "../types/UserType.types";

type Props = {
  boats: Boat[];
  selectedBoats: Boat[];
  toggleSelectBoat: (id: string) => void;
  handleDelete: (id: string) => void;
  handleUpdate: (id: string) => void;
};

export default function TheBoat({ boats, selectedBoats, toggleSelectBoat, handleDelete, handleUpdate }: Props) {
  return (
    <View>
      {boats.map(boat => (
        <ABoat
          key={boat.id}
          boat={boat}
          isSelected={selectedBoats.some(b => b.id === boat.id)}
          toggleSelectBoat={toggleSelectBoat}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
        />
      ))}
    </View>
  );
}
