import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function IoTScreen() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDispositivos();
  }, []);

  const cargarDispositivos = async () => {
    try {
      setLoading(true);
      // Petición al endpoint de dispositivos IoT en el Backend
      const response = await api.get('/iot');
      if (Array.isArray(response.data)) {
        setDispositivos(response.data);
      } else if (response.data?.dispositivos) {
        setDispositivos(response.data.dispositivos);
      }
    } catch (error) {
      console.log('Backend sin endpoint /iot. Cargando datos de respaldo...');
      // Datos de prueba/demostración
      setDispositivos([
        {
          id: '1',
          nombre: 'Módulo GPS-01',
          placa: 'MB-102',
          ip: '192.168.1.45',
          estado: 'online',
          bateria: '12.6 V',
          satelites: 11,
          ultimaConexion: 'Hace 2 min',
          temperatura: '32 °C',
        },
        {
          id: '2',
          nombre: 'Módulo GPS-02',
          placa: 'MB-205',
          ip: '192.168.1.48',
          estado: 'online',
          bateria: '12.4 V',
          satelites: 9,
          ultimaConexion: 'Hace 1 min',
          temperatura: '34 °C',
        },
        {
          id: '3',
          nombre: 'Módulo GPS-03',
          placa: 'MB-301',
          ip: '192.168.1.52',
          estado: 'offline',
          bateria: '11.1 V',
          satelites: 0,
          ultimaConexion: 'Hace 45 min',
          temperatura: '28 °C',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDispositivos();
  };

  const onlineCount = dispositivos.filter((d) => d.estado === 'online').length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
      }
    >
      {/* TARJETA DE ESTADO GENERAL HARDWARE */}
      <View style={styles.systemStatusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="hardware-chip-outline" size={24} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.systemTitle}>Red M2M / Telemetría IoT</Text>
            <Text style={styles.systemSubtitle}>
              {onlineCount} de {dispositivos.length} módulos transmitiendo
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Protocolo</Text>
            <Text style={styles.metricValue}>MQTT / HTTP</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Frecuencia</Text>
            <Text style={styles.metricValue}>5 segundos</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Servidor IoT</Text>
            <Text style={styles.metricValue}>Activo</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Módulos Instalados</Text>

      {/* LISTADO DE DISPOSITIVOS */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Consultando estado del hardware...</Text>
        </View>
      ) : (
        dispositivos.map((item) => {
          const isOnline = item.estado === 'online';

          return (
            <View key={item.id} style={styles.deviceCard}>
              {/* CABECERA TARJETA */}
              <View style={styles.cardHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{item.nombre}</Text>
                  <Text style={styles.devicePlaca}>Asignado a: {item.placa}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isOnline ? '#052E16' : '#450A0A' },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isOnline ? '#22C55E' : '#EF4444' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: isOnline ? '#4ADE80' : '#FCA5A5' },
                    ]}
                  >
                    {isOnline ? 'En línea' : 'Sin señal'}
                  </Text>
                </View>
              </View>

              {/* DETALLES TÉCNICOS DE TELEMETRÍA */}
              <View style={styles.telemetryGrid}>
                <View style={styles.telemetryBox}>
                  <Ionicons name="battery-charging-outline" size={16} color="#38BDF8" />
                  <Text style={styles.telemetryLabel}>Batería</Text>
                  <Text style={styles.telemetryValue}>{item.bateria}</Text>
                </View>

                <View style={styles.telemetryBox}>
                  <Ionicons name="navigate-outline" size={16} color="#38BDF8" />
                  <Text style={styles.telemetryLabel}>Satélites</Text>
                  <Text style={styles.telemetryValue}>{item.satelites} GPS</Text>
                </View>

                <View style={styles.telemetryBox}>
                  <Ionicons name="thermometer-outline" size={16} color="#38BDF8" />
                  <Text style={styles.telemetryLabel}>Temp.</Text>
                  <Text style={styles.telemetryValue}>{item.temperatura}</Text>
                </View>
              </View>

              {/* PIE DE TARJETA */}
              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>IP: {item.ip}</Text>
                <Text style={styles.footerText}>Actualizado: {item.ultimaConexion}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  systemStatusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#0284C7',
    borderWidth: 1,
  },
  systemTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  systemSubtitle: {
    color: '#38BDF8',
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  devicePlaca: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  telemetryBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
  },
  telemetryLabel: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  telemetryValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  footerText: {
    color: '#64748B',
    fontSize: 10,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
});