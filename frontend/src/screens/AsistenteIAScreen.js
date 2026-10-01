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
import { Ionicons } from '@expo/vector-icons';
import { api } from '../config/api';

export default function AsistenteIAScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de transporte inteligente. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  const sugerencias = [
    '¿Cuántas unidades están activas?',
    '¿Cuál es el estado de la Ruta 44?',
    'Reporte de velocidad promedio',
  ];

  const enviarMensaje = async (textoAEnviar) => {
    const mensajeTexto = textoAEnviar || inputText;
    if (!mensajeTexto.trim()) return;

    // 1. Crear y agregar el mensaje del usuario
    const userMsg = {
      id: Date.now().toString(),
      text: mensajeTexto,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // 2. Consulta al Backend
      const response = await api.post('/asistente/chat', { mensaje: mensajeTexto });
      
      const botReplyText = response.data?.respuesta || response.data?.message || 'Procesé tu consulta correctamente.';

      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: botReplyText,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.log('Error al comunicarse con la IA:', error);
      
      // Mensaje de respuesta por defecto si falla el endpoint del backend temporalmente
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: 'Ocurrió una falla al conectar con el servidor de IA. Asegúrate de que la ruta /asistente/chat esté disponible en el Backend.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* CABECERA DE LA PANTALLA */}
      <View style={styles.header}>
        <View style={styles.botIconContainer}>
          <Ionicons name="sparkles" size={20} color="#38BDF8" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Asistente de Tránsito IA</Text>
          <Text style={styles.headerSubtitle}>En línea • Respuestas en tiempo real</Text>
        </View>
      </View>

      {/* SUGERENCIAS RÁPIDAS */}
      <View style={styles.sugerenciasContainer}>
        <FlatList
          data={sugerencias}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chip}
              onPress={() => enviarMensaje(item)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#38BDF8" />
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* LISTA DE MENSAJES (CHAT) */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.timeText}>{item.timestamp}</Text>
            </View>
          );
        }}
      />

      {/* INDICADOR DE PENSANDO */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#38BDF8" />
          <Text style={styles.loadingText}>La IA está analizando la información...</Text>
        </View>
      )}

      {/* BARRA DE ENTRADA DE TEXTO */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu consulta sobre el transporte..."
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => enviarMensaje(inputText)}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  botIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#38BDF8',
    borderWidth: 1,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#22C55E',
    fontSize: 12,
  },
  sugerenciasContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderColor: '#334155',
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0284C7',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    borderColor: '#334155',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#0284C7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
});