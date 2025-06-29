import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './SidebarStyle'; // adjust path if needed

export default function Sidebar({ onSelectPage, activePage }) {
  const menuItems = [
    { label: 'Dashboard', icon: 'view-dashboard', page: 'Dashboard' },
    { label: 'Data Sources', icon: 'database', page: 'DataSources' },
    { label: 'File Uploads', icon: 'upload', page: 'FileUploads' },
    { label: 'Data Joins', icon: 'link', page: 'DataJoins' },
    { label: 'Visualizations', icon: 'chart-bar', page: 'Visualizations' },
    { label: 'Reports', icon: 'file-document', page: 'Reports' },
    { label: 'Settings', icon: 'cog', page: 'Settings' },
  ];

  return (
    <View style={styles.sidebar}>
      <Text style={styles.logo}>📊 DataViz Pro</Text>
      <Text style={styles.subtitle}>Real-time Analytics</Text>

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.menuItem,
            activePage === item.page && { backgroundColor: '#e0e7ff', borderRadius: 8 },
          ]}
          onPress={() => onSelectPage(item.page)}
        >
          <Icon
            name={item.icon}
            size={20}
            color={activePage === item.page ? '#4c68d7' : '#555'}
            style={{ marginRight: 10 }}
          />
          <Text
            style={[
              styles.menuText,
              activePage === item.page && { color: '#4c68d7', fontWeight: 'bold' },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.newProjectBtn}>
        <Text style={styles.newProjectText}>+ New Project</Text>
      </TouchableOpacity>
    </View>
  );
}
