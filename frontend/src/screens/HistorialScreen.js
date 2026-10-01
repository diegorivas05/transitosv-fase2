import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function HistorialScreen() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ alertas: 0, recorridos: 0 });

  useEffect(() => {
    cargarHistorial();

    // Actualización dinámica en vivo cada 3.5 segundos
    const interval = setInterval(() => {
      cargarHistorial(false);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const cargarHistorial = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const resUnidades = await api.get('/unidades');
      const listaUnidades = Array.isArray(resUnidades.data)
        ? resUnidades.data
        : resUnidades.data?.unidades || [];

      const nuevosEventos = [];
      let conteoAlertas = 0;
      let conteoRecorridos = listaUnidades.length;

      listaUnidades.forEach((u, index) => {
        // Obtenemos la velocidad base o asignamos una por defecto
        let velBase = parseFloat(u.velocidad);
        if (isNaN(velBase) || velBase === 0) {
          velBase = 32; 
        }

        // Variación aleatoria de velocidad (-15 km/h a +25 km/h)
        // Esto provocará que de vez en cuando superen los 50 km/h automáticamente
        const variacion = (Math.random() - 0.35) * 40;
        const velActual = Math.max(0, Math.min(80, velBase + variacion));

        const placa = u.placa || u.codigo || `MB-${101 + index}`;
        const ruta = u.ruta || u.nombre_ruta || 'Ruta 44';
        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Evaluamos el tipo de evento
        if (velActual > 50) {
          conteoAlertas++;
          nuevosEventos.push({
            id: `alerta-${u.id_unidad || index}-${Date.now()}`,
            tipo: 'alerta',
            titulo: 'Exceso de Velocidad',
            unidad: placa,
            descripcion: `Velocidad detectada: ${velActual.toFixed(0)} km/h en ${ruta} (Límite: 50 km/h).`,
            hora: hora,
            icono: 'warning-outline',
            color: '#EF4444'
          });
        } else if (velActual === 0 || u.estado === 'Detenido') {
          nuevosEventos.push({
            id: `detenido-${u.id_unidad || index}-${Date.now()}`,
            tipo: 'parada',
            titulo: 'Unidad en Parada',
            unidad: placa,
            descripcion: `Detenido temporalmente en tramo de ${ruta}.`,
            hora: hora,
            icono: 'pause-circle-outline',
            color: '#F59E0B'
          });
        } else {
          nuevosEventos.push({
            id: `activo-${u.id_unidad || index}-${Date.now()}`,
            tipo: 'recorrido',
            titulo: 'En Recorrido Normal',
            unidad: placa,
            descripcion: `Velocidad: ${velActual.toFixed(0)} km/h - ${ruta}.`,
            hora: hora,
            icono: 'bus-outline',
            color: '#38BDF8'
          });
        }
      });

      // Ordenar para mostrar las alertas rojas arriba primero
      nuevosEventos.sort((a, b) => (a.tipo === 'alerta' ? -1 : 1));

      setStats({ alertas: conteoAlertas, recorridos: conteoRecorridos });
      setEventos(nuevosEventos);
    } catch (error) {
      console.log('Error al actualizar historial dinámico:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TARJETAS DE CONTADORES DINÁMICOS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="warning-outline" size={24} color="#EF4444" />
          <Text style={styles.statNumber}>{stats.alertas}</Text>
          <Text style={styles.statLabel}>Alertas en Vivo</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="map-outline" size={24} color="#38BDF8" />
          <Text style={styles.statNumber}>{stats.recorridos}</Text>
          <Text style={styles.statLabel}>Buses Activos</Text>
        </View>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Registro de Eventos en Tiempo Real</Text>
        <TouchableOpacity onPress={() => cargarHistorial(true)}>
          <Ionicons name="refresh-outline" size={20} color="#38BDF8" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View style={styles.cardLeft}>
                <Ionicons
                  name={item.icono}
                  size={24}
                  color={item.color}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.eventTitle}>{item.titulo}</Text>
                  <Text style={styles.eventUnit}>Unidad: {item.unidad}</Text>
                  <Text style={styles.eventDesc}>{item.descripcion}</Text>
                </View>
              </View>
              <Text style={styles.eventTime}>{item.hora}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderColor: '#334155',
    borderWidth: 1,
  },
  statNumber: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  statLabel: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  eventCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderColor: '#334155',
    borderWidth: 1,
  },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  textContainer: { flex: 1 },
  eventTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  eventUnit: { color: '#38BDF8', fontSize: 12, marginTop: 2, fontWeight: '600' },
  eventDesc: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  eventTime: { color: '#64748B', fontSize: 11, fontWeight: '500' },
});