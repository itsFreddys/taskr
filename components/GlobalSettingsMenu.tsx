import React from 'react';
import { View } from 'react-native';
import { Menu, IconButton, Divider } from 'react-native-paper';
import { useAppTheme } from '@/lib/theme-context';

export function GlobalSettingsMenu() {
  const [visible, setVisible] = React.useState(false);
  const { themeMode, setThemeMode } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <IconButton 
            icon="menu" 
            onPress={() => setVisible(true)} 
          />
        }
      >
        <Menu.Item 
          leadingIcon={themeMode === 'light' ? 'check' : 'white-balance-sunny'} 
          onPress={() => setThemeMode('light')} 
          title="Light Mode" 
        />
        <Menu.Item 
          leadingIcon={themeMode === 'dark' ? 'check' : 'moon-waning-crescent'} 
          onPress={() => setThemeMode('dark')} 
          title="Dark Mode" 
        />
        <Menu.Item 
          leadingIcon={themeMode === 'system' ? 'check' : 'cellphone-cog'} 
          onPress={() => setThemeMode('system')} 
          title="System Default" 
        />
        <Divider />
        <Menu.Item onPress={() => {}} title="App Settings" />
      </Menu>
    </View>
  );
}