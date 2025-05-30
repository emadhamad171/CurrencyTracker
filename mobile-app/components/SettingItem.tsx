import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  icon: string;
  text: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  textColor?: string;
  iconColor?: string;
}

export const SettingItem: React.FC<Props> = ({
  icon,
  text,
  value,
  onPress,
  showChevron = false,
  textColor,
  iconColor,
}) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon as any} size={24} color={iconColor || '#666666'} />
      <Text style={[styles.settingText, { color: textColor || '#000000' }]}>{text}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showChevron && <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
    color: '#666666',
  },
});
