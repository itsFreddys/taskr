import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

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
  position?: { top: number; left: number }; // 👈 NEW
};

export default function CustomMenu({
  visible,
  onDismiss,
  items,
  anchor,
  position = { top: 50, left: 0 },
}: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <View>
      {anchor}

      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.overlay} onPress={onDismiss}>
          <View
            style={[
              styles.menuContainer,
              {
                position: "absolute",
                top: position.top,
                left: position.left,
              },
            ]}
          >
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
    },
    menuContainer: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.dark ? theme.colors.onSurfaceVariant : "#000",
      borderRadius: 10,
      paddingVertical: 6,
      width: 180,
      shadowColor: theme.dark ? theme.colors.onSurfaceVariant : "#000",
      shadowOpacity: 0.1,
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
      color: theme.colors.onSurfaceVariant,
    },
  });
