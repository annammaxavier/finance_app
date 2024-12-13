import { StyleSheet,UseEffect, Text, View } from "react-native";
import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./app/src/screen/HomeScreen";
import LoginScreen from "./app/src/screen/LoginScreen";
import SignupScreen from "./app/src/screen/SignupScreen";
import ExpenseApp from "./app/src/screen/ExpenseApp";

const Stack = createStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name={"Home"} component={HomeScreen} />
        <Stack.Screen name={"Login"} component={LoginScreen} />
        <Stack.Screen name={"Signup"} component={SignupScreen} />
        <Stack.Screen name={"Expense Home"} component={ExpenseApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});