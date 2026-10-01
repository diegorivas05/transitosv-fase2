import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';

export default function AsistenteIAScreen() {
  const [mensajes, setMensajes] = useState([
    {
      id: '1',
      emisor: 'ia',
      texto: '¡Hola! Soy el asistente inteligente de TránsitoSV. ¿En qué te puedo ayudar hoy con respecto al tráfico, rutas o estado de la flota?',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const flatListRef = useRef(null);

  const enviarMensaje = async () => {
    // 1. Evita envíos vacíos o peticiones dobles cuando ya está cargando
    if (!inputTexto.trim() || cargando) return;

    const textoUsuario = inputTexto.trim();
    const horaEnvio = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nuevoMensajeUsuario = {
      id: Date.now().toString(),
      emisor: 'usuario',
      texto: textoUsuario,
      hora: horaEnvio,
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInputTexto('');
    setCargando(true);

    try {
      // 2. Petición al endpoint del backend donde corre Gemini
      const res = await api.post('/asistente/chat', { mensaje: textoUsuario });
      
      const respuestaTexto = res.data?.respuesta || res.data?.mensaje;

      if (respuestaTexto) {
        agregarRespuestaIA(respuestaTexto);
      } else {
        agregarRespuestaIA('No pude obtener una respuesta válida del servidor telemático.');
      }
    } catch (error) {
      console.log('Error conectando con la IA del backend:', error?.response?.data || error.message);
      agregarRespuestaIA('El servicio de IA no está disponible en este momento. Verifica que el servidor backend esté activo.');
    } finally {
      setCargando(false);
    }
  };

  const agregarRespuestaIA = (texto) => {
    const nuevoMensajeIA = {
      id: (Date.now() + 1).toString(),
      emisor: 'ia',
      texto: texto,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMensajes((prev) => [...prev, nuevoMensajeIA]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* CABECERA / HEADER */}
        <View style={styles.header}>
          <Ionicons name="sparkles-outline" size={24} color="#38BDF8" />
          <View>
            <Text style={styles.headerTitle}>Asistente TránsitoSV</Text>
            <Text style={styles.headerSubtitle}>Monitoreo y Consultas Inteligentes</Text>
          </View>
        </View>

        {/* LISTA DE MENSAJES */}
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const esUsuario = item.emisor === 'usuario';
            return (
              <View
                style={[
                  styles.burbujaContainer,
                  esUsuario ? styles.containerUsuario : styles.containerIA,
                ]}
              >
                <View
                  style={[
                    styles.burbuja,
                    esUsuario ? styles.burbujaUsuario : styles.burbujaIA,
                  ]}
                >
                  <Text style={styles.mensajeTexto}>{item.texto}</Text>
                  <Text style={styles.horaTexto}>{item.hora}</Text>
                </View>
              </View>
            );
          }}
        />

        {cargando && (
          <View style={styles.indicadorCargando}>
            <ActivityIndicator size="small" color="#38BDF8" />
            <Text style={styles.cargandoTexto}>Consultando datos de la flota...</Text>
          </View>
        )}

        {/* CAMPO DE ENTRADA / INPUT BAR */}
        <View style={styles.inputBarra}>
          <TextInput
            style={styles.input}
            placeholder="Escribe una pregunta sobre la flota..."
            placeholderTextColor="#64748B"
            value={inputTexto}
            onChangeText={setInputTexto}
            onSubmitEditing={enviarMensaje}
          />
          <TouchableOpacity 
            style={[styles.botonEnviar, cargando && { backgroundColor: '#64748B' }]} 
            onPress={enviarMensaje}
            disabled={cargando}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { color: '#38BDF8', fontSize: 12 },
  chatList: { padding: 16, paddingBottom: 20 },
  burbujaContainer: { marginBottom: 12, flexDirection: 'row' },
  containerUsuario: { justifyContent: 'flex-end' },
  containerIA: { justifyContent: 'flex-start' },
  burbuja: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  burbujaUsuario: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  burbujaIA: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderColor: '#334155',
    borderWidth: 1,
  },
  mensajeTexto: { color: '#F8FAFC', fontSize: 14, lineHeight: 20 },
  horaTexto: { color: '#94A3B8', fontSize: 10, marginTop: 4, textAlign: 'right' },
  indicadorCargando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  cargandoTexto: { color: '#94A3B8', fontSize: 12 },
  inputBarra: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 14,
    borderColor: '#334155',
    borderWidth: 1,
  },
  botonEnviar: {
    backgroundColor: '#0284C7',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});