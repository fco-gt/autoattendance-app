import MensajeError from '@/components/ErrorMessage';
import IndicadorCarga from '@/components/LoadingIndicator';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/services/userService';
import { UserFrontend, UserFrontendStatus } from '@/types';
import { formatearFechaDesdeISO } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Componente que muestra la pantalla de perfil del usuario
 * Permite visualizar la información personal y de cuenta del usuario
 */
export default function PantallaPerfilUsuario() {
  const { user: usuarioAuth, signOut: cerrarSesion } = useAuth();
  const [usuario, setUsuario] = useState<UserFrontend | null>(usuarioAuth);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

  /**
   * Función para obtener los datos del perfil del usuario
   */
  const obtenerPerfilUsuario = async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) {
        setCargando(true);
      }
      const datosUsuario = await getUserProfile();
      setUsuario(datosUsuario);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el perfil del usuario'
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    obtenerPerfilUsuario();
  }, []);

  // Actualizar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      obtenerPerfilUsuario(false);
    }, [])
  );

  /**
   * Manejador para actualizar los datos mediante pull-to-refresh
   */
  const manejarActualizacion = () => {
    setActualizando(true);
    obtenerPerfilUsuario(false);
  };

  /**
   * Manejador para confirmar y ejecutar el cierre de sesión
   */
  const manejarCierreSesion = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: () => cerrarSesion(),
      },
    ]);
  };

  /**
   * Obtiene el color correspondiente al estado del usuario
   * @param estado Estado del usuario
   * @returns Color hexadecimal correspondiente al estado
   */
  const obtenerColorEstado = (estado: UserFrontendStatus) => {
    switch (estado) {
      case UserFrontendStatus.ACTIVE:
        return '#06D6A0'; // Verde para activo
      case UserFrontendStatus.PENDING:
        return '#FFD166'; // Amarillo para pendiente
      case UserFrontendStatus.INACTIVE:
        return '#EF476F'; // Rojo para inactivo
      default:
        return '#BBBBBB'; // Gris para estados desconocidos
    }
  };

  /**
   * Traduce el estado del usuario a español
   * @param estado Estado del usuario
   * @returns Texto del estado en español
   */
  const traducirEstado = (estado: UserFrontendStatus) => {
    switch (estado) {
      case UserFrontendStatus.ACTIVE:
        return 'ACTIVO';
      case UserFrontendStatus.PENDING:
        return 'PENDIENTE';
      case UserFrontendStatus.INACTIVE:
        return 'INACTIVO';
      default:
        return estado;
    }
  };

  /**
   * Renderiza un campo de información del perfil
   * @param etiqueta Nombre del campo
   * @param valor Valor del campo
   * @returns Componente con la etiqueta y valor del campo
   */
  const renderizarCampoPerfil = (
    etiqueta: string,
    valor: string | null | undefined
  ) => (
    <View style={estilos.contenedorCampo}>
      <Text style={estilos.etiquetaCampo}>{etiqueta}</Text>
      <Text style={estilos.valorCampo}>{valor || 'No proporcionado'}</Text>
    </View>
  );

  // Renderizado condicional para estado de carga
  if (cargando) {
    return <IndicadorCarga />;
  }

  // Renderizado condicional para estado de error
  if (error) {
    return <MensajeError message={error} />;
  }

  // Renderizado condicional si no hay datos de usuario
  if (!usuario) {
    return (
      <View style={estilos.contenedor}>
        <Text style={estilos.textoError}>
          No se pudo cargar la información del usuario
        </Text>
        <TouchableOpacity
          style={estilos.botonCerrarSesion}
          onPress={manejarCierreSesion}
        >
          <Text style={estilos.textoBotonCerrarSesion}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizado principal del perfil
  return (
    <ScrollView
      style={estilos.contenedor}
      contentContainerStyle={estilos.contenedorContenido}
      refreshControl={
        <RefreshControl
          refreshing={actualizando}
          onRefresh={manejarActualizacion}
          colors={['#0066CC']}
          tintColor="#0066CC"
        />
      }
    >
      <View style={estilos.encabezadoPerfil}>
        <Text style={estilos.nombreUsuario}>
          {usuario.name} {usuario.lastname || ''}
        </Text>
        <View style={estilos.contenedorEstado}>
          <Text
            style={[
              estilos.textoEstado,
              { color: obtenerColorEstado(usuario.status) },
            ]}
          >
            {traducirEstado(usuario.status)}
          </Text>
        </View>
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Información Personal</Text>
        {renderizarCampoPerfil('Correo Electrónico', usuario.email)}
        {renderizarCampoPerfil('ID de Empleado', usuario.id)}
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Información de Cuenta</Text>
        {renderizarCampoPerfil(
          'Creado',
          formatearFechaDesdeISO(usuario.createdAt)
        )}
        {renderizarCampoPerfil(
          'Última Actualización',
          formatearFechaDesdeISO(usuario.updatedAt)
        )}
      </View>

      <TouchableOpacity
        style={estilos.botonCerrarSesion}
        onPress={manejarCierreSesion}
        accessibilityLabel="Botón para cerrar sesión"
        accessibilityRole="button"
      >
        <Text style={estilos.textoBotonCerrarSesion}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * Estilos para el componente de perfil de usuario
 */
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contenedorContenido: {
    padding: 16,
    paddingBottom: 32, // Espacio adicional en la parte inferior
  },
  encabezadoPerfil: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contenedorAvatar: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  indicadorEstado: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    bottom: 5,
    right: 5,
  },
  nombreUsuario: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  contenedorEstado: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  textoEstado: {
    fontSize: 14,
    fontWeight: '600',
  },
  seccion: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  contenedorCampo: {
    marginBottom: 16,
  },
  etiquetaCampo: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  valorCampo: {
    fontSize: 16,
    color: '#333333',
  },
  botonCerrarSesion: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBotonCerrarSesion: {
    color: '#EF476F',
    fontSize: 16,
    fontWeight: '600',
  },
  textoError: {
    fontSize: 16,
    color: '#EF476F',
    textAlign: 'center',
    marginBottom: 20,
    padding: 16,
  },
});
