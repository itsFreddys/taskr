import { StyleSheet, Text, View } from "react-native";

export default function StreakScreen() {
  return (
    <View style={styles.view}>
      <Text>this is the Streak screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    width: 200,
    height: 20,
    backgroundColor: "grey",
    borderRadius: 8,
    textAlign: "center",
  },
});
