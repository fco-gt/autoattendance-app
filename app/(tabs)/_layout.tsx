import React from 'react';
import { Tabs } from 'expo-router';
import { Home, QrCode, User, Calendar } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();

  // Colors based on color scheme
  const activeColor = '#0077B6';
  const inactiveColor = colorScheme === 'dark' ? '#888888' : '#AAAAAA';
  const backgroundColor = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#1A1A1A',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: `Bienvenido, ${user?.name}`,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Escanear QR',
          tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Asistencias',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
