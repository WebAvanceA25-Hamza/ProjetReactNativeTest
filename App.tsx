// App.tsx
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./components/LoginScreen";
import Accueil from "./components/Accueil";
import { Boat } from "./types/UserType.types";
import UpdateBoat from "./components/UpdateBoat";
import navigations from "./components/navigations";

export type RootStackParamList = {
  Login: undefined;
  AccueilHome: {
    userName: string;
    password: string;
    boatList: Boat[];
  };
  UpdateBoat: {
    boatid: string;
  };
  Autresnavigations: {
    idBoat: string;
  }
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Connexion" }}
        />
        <Stack.Screen
          name="AccueilHome"
          component={Accueil}
          options={{ title: "Accueil" }}
        />
         <Stack.Screen
          name="UpdateBoat"
          component={UpdateBoat}
          options={{ title: "Modifier" }}
        />
         <Stack.Screen
          name="Autresnavigations"
          component={navigations}
          options={{ title: "pagesnavigations" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
