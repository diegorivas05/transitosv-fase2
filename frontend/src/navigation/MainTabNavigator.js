import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MapaScreen from '../screens/MapaScreen';
import AsistenteIAScreen from '../screens/AsistenteIAScreen';
import HistorialScreen from '../screens/HistorialScreen';
import IoTScreen from '../screens/IoTScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#FFF',
        tabBarStyle: { backgroundColor: '#1E293B', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Mapa') iconName = 'map-outline';
          else if (route.name === 'Asistente IA') iconName = 'chatbubble-ellipses-outline';
          else if (route.name === 'Historial') iconName = 'stats-chart-outline';
          else if (route.name === 'IoT') iconName = 'hardware-chip-outline';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Mapa" component={MapaScreen} />
      <Tab.Screen name="Asistente IA" component={AsistenteIAScreen} />
      <Tab.Screen name="Historial" component={HistorialScreen} />
      <Tab.Screen name="IoT" component={IoTScreen} />
    </Tab.Navigator>
  );
}