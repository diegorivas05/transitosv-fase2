import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function HistorialScreen() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'alertas' | 'rutas'

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      // Petición al endpoint del Backend
      const response = await api.get('/historial');
      if (Array.isArray(response.data)) {
        setHistorial(response.data);
      } else if (response.data?.historial) {
        setHistorial(response.data.historial);
      }
    } catch (error) {
      console.log('Backend sin endpoint /historial. Cargando datos de respaldo...');
      // Datos de demostración en caso de que el backend aún no tenga el endpoint
      setHistorial([
        {
          id: '1',
          tipo: 'alerta',
          titulo: 'Exceso de Velocidad',
          descripcion: 'Unidad MB-102 superó los 65 km/h en Zona Urbana.',
          placa: 'MB-102',
          hora: '06:15 PM',
          fecha: 'Hoy',
          severidad: 'alta',
        },
        {
          id: '2',
          tipo: 'ruta',
          titulo: 'Llegada a Parada Final',
          descripcion: 'Unidad MB-205 completó el recorrido de Ruta 101B.',
          placa: 'MB-205',
          hora: '05:40 PM',
          fecha: 'Hoy',
          severidad: 'info',
        },
        {
          id: '3',
          tipo: 'alerta',
          titulo: 'Desvío de Ruta',
          descripcion: 'Unidad MB-301 salió del trayecto asignado.',
          placa: 'MB-301',
          hora: '04:20 PM',
          fecha: 'Hoy',
          severidad: 'media',
        },
        {
          id: '4',
          tipo: 'ruta',
          titulo: 'Inicio de Recorrido',
          descripcion: 'Unidad MB-102 inició servicio en Estación Central.',
          placa: 'MB-102',
          hora: '03:00 PM',
          fecha: 'Hoy',
          severidad: 'info',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarHistorial();
  };

  // Filtrado de eventos
  const datosFiltrados = historial.filter((item) => {
    if (filtro === 'alertas') return item.tipo === 'alerta';
    if (filtro === 'rutas') return item.tipo === 'ruta';
    return true;
  });

  const getIconBySeveridad = (tipo, severidad) => {
    if (tipo === 'alerta') {
      return severidad === 'alta' ? 'warning' : 'alert-circle';
    }
    return 'checkmark-circle';
  };

  const getColorBySeveridad = (tipo, severidad) => {
    if (tipo === 'alerta') {
      return severidad === 'alta' ? '#EF4444' : '#F59E0B';
    }
    return '#10B981';
  };

  return (
    <View style={styles.container}>
      {/* TARJETAS DE RESUMEN */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="notifications-outline" size={22} color="#38BDF8" />
          <Text style={styles.summaryNumber}>{historial.length}</Text>
          <Text style={styles.summaryLabel}>Total Eventos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="warning-outline" size={22} color="#EF4444" />
          <Text style={styles.summaryNumber}>
            {historial.filter((i) => i.tipo === 'alerta').length}
          </Text>
          <Text style={styles.summaryLabel}>Alertas</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="map-outline" size={22} color="#10B981" />
          <Text style={styles.summaryNumber}>
            {historial.filter((i) => i.tipo === 'ruta').length}
          </Text>
          <Text style={styles.summaryLabel}>Recorridos</Text>
        </View>
      </View>

      {/* FILTROS */}
      <View style={styles.filterContainer}>
        {['todos', 'alertas', 'rutas'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filtro === f && styles.filterChipActive]}
            onPress={() => setFiltro(f)}
          >
            <Text
              style={[
                styles.filterText,
                filtro === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA DE HISTORIAL */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Cargando bitácora...</Text>
        </View>
      ) : (
        <FlatList
          data={datosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#38BDF8"
            />
          }
          renderItem={({ item }) => {
            const color = getColorBySeveridad(item.tipo, item.severidad);
            const icon = getIconBySeveridad(item.tipo, item.severidad);

            return (
              <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.titulo}</Text>
                    <Text style={styles.cardTime}>{item.hora}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{item.descripcion}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.badgePlaca}>
                      <Ionicons name="bus-outline" size={12} color="#94A3B8" />
                      <Text style={styles.placaText}>{item.placa}</Text>
                    </View>
                    <Text style={styles.cardDate}>{item.fecha}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
  },
  summaryNumber: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderColor: '#334155',
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardTime: {
    color: '#64748B',
    fontSize: 11,
  },
  cardDescription: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePlaca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  placaText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  cardDate: {
    color: '#64748B',
    fontSize: 11,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});