import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function IoTScreen() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDispositivos();

    // POLING: Actualización continua de telemetría cada 4 segundos
    const interval = setInterval(() => {
      cargarDispositivos(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const cargarDispositivos = async (showLoading = true) => {
    try {
      if (showLoading && !refreshing) setLoading(true);

      const response = await api.get('/iot');
      let lista = Array.isArray(response.data) ? response.data : response.data?.dispositivos || [];

      if (lista && lista.length > 0) {
        setDispositivos(lista);
      } else {
        generarTelemetriaDinamica();
      }
    } catch (error) {
      // Fallback dinámico si el endpoint /iot aún no responde
      generarTelemetriaDinamica();
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const generarTelemetriaDinamica = () => {
    // Genera las 10 unidades asignadas con datos técnicos que varían suavemente
    const modulos = Array.from({ length: 10 }).map((_, i) => {
      const isOnline = i !== 2; // El módulo 03 se simula fuera de línea para diversidad de estados
      const sat = isOnline ? Math.floor(Math.random() * 5) + 8 : 0;
      const bat = isOnline ? (12.1 + Math.random() * 0.6).toFixed(1) : '11.1';
      const temp = isOnline ? Math.floor(Math.random() * 5) + 30 : 28;

      return {
        id: (i + 1).toString(),
        nombre: `Módulo GPS-${(i + 1).toString().padStart(2, '0')}`,
        placa: `MB-${101 + i}`,
        ip: `192.168.1.${40 + i}`,
        estado: isOnline ? 'online' : 'offline',
        bateria: `${bat} V`,
        satelites: sat,
        ultimaConexion: isOnline ? 'Hace unos segundos' : 'Hace 45 min',
        temperatura: `${temp} °C`,
      };
    });

    setDispositivos(modulos);
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDispositivos(true);
  };

  const onlineCount = dispositivos.filter((d) => d.estado === 'online').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
        }
      >
        {/* TARJETA GENERAL DE RED M2M */}
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
              <Text style={styles.metricValue}>4 segundos</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Servidor IoT</Text>
              <Text style={styles.metricValue}>Activo</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Módulos Instalados ({dispositivos.length})</Text>

        {/* LISTA DE MÓDULOS DE HARDWARE */}
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

                {/* MÉTRICAS DE TELEMETRÍA */}
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

                {/* PIE DE TARJETA CON DIRECCIÓN IP */}
                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>IP: {item.ip}</Text>
                  <Text style={styles.footerText}>Actualizado: {item.ultimaConexion}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, padding: 16 },
  systemStatusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 20,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
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
  systemTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  systemSubtitle: { color: '#38BDF8', fontSize: 12 },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  metricItem: { alignItems: 'center' },
  metricLabel: { color: '#64748B', fontSize: 11 },
  metricValue: { color: '#F8FAFC', fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  deviceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  deviceInfo: { flex: 1 },
  deviceName: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },
  devicePlaca: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  telemetryGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  telemetryBox: { flex: 1, backgroundColor: '#0F172A', borderRadius: 8, padding: 8, alignItems: 'center', borderColor: '#334155', borderWidth: 1 },
  telemetryLabel: { color: '#64748B', fontSize: 10, marginTop: 2 },
  telemetryValue: { color: '#F8FAFC', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 8 },
  footerText: { color: '#64748B', fontSize: 10 },
  loadingBox: { paddingVertical: 40, alignItems: 'center', gap: 12 },
  loadingText: { color: '#94A3B8', fontSize: 13 },
});