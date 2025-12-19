import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuItem = {
  label: string;
  onPress: () => void;
  danger?: boolean;
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
  items: MenuItem[];
  anchor: React.ReactNode;
};

export default function CustomMenu({
  visible,
  onDismiss,
  items,
  anchor,
}: Props) {
  return (
    <View>
      {/* Anchor */}
      {anchor}

      {/* Overlay */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.overlay} onPress={onDismiss}>
          <View style={styles.menuContainer}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  item.onPress();
                  onDismiss();
                }}
                style={styles.menuItem}
              >
                <Text
                  style={[styles.menuText, item.danger && { color: "red" }]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 50,
    paddingRight: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  menuContainer: {
    marginTop: 120,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 6,
    width: 120,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: 16,
  },
});
