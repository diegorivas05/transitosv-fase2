import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { unidadService } from '../services/unidadService';

export default function MapaScreen() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnidad, setSelectedUnidad] = useState(null);

  useEffect(() => {
    cargarUnidades();
  }, []);

  const cargarUnidades = async () => {
    try {
      setLoading(true);
      const data = await unidadService.getUnidades();
      if (Array.isArray(data)) {
        setUnidades(data);
      } else if (data && data.unidades) {
        setUnidades(data.unidades);
      }
    } catch (error) {
      console.log('Error al cargar unidades del backend:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generamos el HTML interactivo con Leaflet + OpenStreetMap
  const generarHTMLMapa = () => {
    const marcadoresJS = unidades
      .map((u) => {
        const lat = parseFloat(u.latitud || u.lat || 13.6929);
        const lng = parseFloat(u.longitud || u.lng || -89.2182);
        const placa = u.placa || 'Unidad';
        const ruta = u.ruta || 'Sin Ruta';
        return `
          L.marker([${lat}, ${lng}])
           .addTo(map)
           .bindPopup("<b>Unidad: ${placa}</b><br>Ruta: ${ruta}");
        `;
      })
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #0F172A;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Centramos el mapa en San Salvador
          var map = L.map('map').setView([13.6929, -89.2182], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          ${marcadoresJS}
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      {/* VISTA DEL MAPA WEBVIEW */}
      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: generarHTMLMapa() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      {/* BOTÓN DE RECARGAR */}
      <TouchableOpacity style={styles.refreshButton} onPress={cargarUnidades}>
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Ionicons name="refresh-outline" size={24} color="#FFF" />
        )}
      </TouchableOpacity>

      {/* PANEL INFERIOR CON UNIDADES */}
      <View style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>Unidades en Circulación ({unidades.length})</Text>

        <FlatList
          data={unidades}
          keyExtractor={(item, index) => (item.id_unidad || index).toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.unitCard,
                selectedUnidad?.id_unidad === item.id_unidad && styles.selectedCard
              ]}
              onPress={() => setSelectedUnidad(item)}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="bus" size={20} color="#38BDF8" />
                <Text style={styles.cardPlaca}>{item.placa}</Text>
              </View>
              <Text style={styles.cardRuta}>{item.ruta || 'Ruta no asignada'}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardSpeed}>{item.velocidad || '30 km/h'}</Text>
                <Text style={[styles.cardStatus, item.estado === 'Detenido' ? styles.statusOff : styles.statusOn]}>
                  {item.estado || 'activo'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapContainer: {
    flex: 1,
    marginBottom: 170, // Espacio para dejar visible el panel inferior
  },
  map: {
    flex: 1,
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    borderColor: '#334155',
    borderWidth: 1,
    zIndex: 10,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    height: 180,
  },
  panelTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  unitCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 150,
    height: 90,
    borderColor: '#334155',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderColor: '#38BDF8',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardPlaca: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardRuta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSpeed: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  cardStatus: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusOn: {
    color: '#22C55E',
  },
  statusOff: {
    color: '#EF4444',
  },
});