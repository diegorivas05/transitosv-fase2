import React, { useState, useEffect, useRef } from 'react';
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

const MAP_HTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body, html, #map { height: 100%; margin: 0; padding: 0; background-color: #0F172A; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map').setView([13.6929, -89.2182], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      var markers = {};

      function renderizarUnidades(unidades) {
        if (!unidades || !Array.isArray(unidades)) return;
        unidades.forEach(function(u) {
          var key = u.id_unidad || u.id || u.placa || u.codigo;
          var nombreUnidad = u.placa || u.codigo || u.codigo_unidad || ('Unidad ' + (u.id_unidad || u.id || ''));
          var nombreRuta = u.ruta || u.nombre_ruta || u.ruta_nombre || 'Ruta activa';

          if (markers[key]) {
            markers[key].setLatLng([u.latitud, u.longitud]);
          } else {
            markers[key] = L.marker([u.latitud, u.longitud])
              .addTo(map)
              .bindPopup("<b>" + nombreUnidad + "</b><br>Ruta: " + nombreRuta);
          }
        });
      }

      function centrarEn(lat, lng) {
        if (map) {
          map.setView([lat, lng], 15);
        }
      }
    </script>
  </body>
  </html>
`;

export default function MapaScreen() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnidad, setSelectedUnidad] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    cargarUnidades();

    const interval = setInterval(() => {
      cargarUnidades(false);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const cargarUnidades = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await unidadService.getUnidades();
      let lista = Array.isArray(data) ? data : data?.unidades || [];

      // Mapear y formatear campos de la BD
      const listaProcesada = lista.map((u, index) => {
        const baseLat = parseFloat(u.latitud || u.lat || 13.6929);
        const baseLng = parseFloat(u.longitud || u.lng || -89.2182);

        const offsetLat = (index % 5) * 0.008 - 0.015;
        const offsetLng = Math.floor(index / 5) * 0.008 - 0.015;

        const jitterLat = (Math.random() - 0.5) * 0.0006;
        const jitterLng = (Math.random() - 0.5) * 0.0006;

        // Mapeo flexible de propiedades para el nombre de la unidad
        const identificador = u.placa || u.codigo || u.codigo_unidad || `MB-${100 + (u.id_unidad || u.id || index + 1)}`;
        const rutaAsignada = u.ruta || u.nombre_ruta || u.ruta_nombre || 'Ruta 44';
        
        // Formatear velocidad limpiamente (ejemplo: 25 km/h)
        const velNum = parseFloat(u.velocidad);
        const velocidadTexto = !isNaN(velNum) ? `${velNum.toFixed(0)} km/h` : '30 km/h';

        return {
          ...u,
          id_unidad: u.id_unidad || u.id || index,
          placaTexto: identificador,
          rutaTexto: rutaAsignada,
          velocidadTexto: velocidadTexto,
          latitud: baseLat + offsetLat + jitterLat,
          longitud: baseLng + offsetLng + jitterLng,
        };
      });

      setUnidades(listaProcesada);
      inyectarMarcadores(listaProcesada);
    } catch (error) {
      console.log('Error al cargar unidades del backend:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const inyectarMarcadores = (lista) => {
    if (webViewRef.current && lista.length > 0) {
      const script = `renderizarUnidades(${JSON.stringify(lista)}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const seleccionarYCentrar = (unidad) => {
    setSelectedUnidad(unidad);
    if (webViewRef.current) {
      const script = `centrarEn(${unidad.latitud}, ${unidad.longitud}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: MAP_HTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoadEnd={() => {
            if (unidades.length > 0) {
              inyectarMarcadores(unidades);
            }
          }}
        />
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={() => cargarUnidades(true)}>
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Ionicons name="refresh-outline" size={24} color="#FFF" />
        )}
      </TouchableOpacity>

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
                selectedUnidad?.id_unidad === item.id_unidad && styles.selectedCard,
              ]}
              onPress={() => seleccionarYCentrar(item)}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="bus" size={20} color="#38BDF8" />
                <Text style={styles.cardPlaca}>{item.placaTexto}</Text>
              </View>
              <Text style={styles.cardRuta}>{item.rutaTexto}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardSpeed}>{item.velocidadTexto}</Text>
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  mapContainer: { flex: 1, marginBottom: 170 },
  map: { flex: 1 },
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
  panelTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  unitCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 155,
    height: 95,
    borderColor: '#334155',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  selectedCard: { borderColor: '#38BDF8', borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardPlaca: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardRuta: { color: '#94A3B8', fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSpeed: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },
  cardStatus: { fontSize: 11, fontWeight: 'bold' },
  statusOn: { color: '#22C55E' },
  statusOff: { color: '#EF4444' },
});