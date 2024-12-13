import { View, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";

const Notfound = () => {
  return (
    <View>
      <Text style={{ fontSize: 26 }}>Oops Screen not found</Text>
      <Link href="/" style={{ fontSize: 26, color: "red" }}>
        Go back to Home Screen
      </Link>
    </View>
  );
};

export default Notfound;