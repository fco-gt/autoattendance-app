/**
 * Utilidades para el formateo de fechas y horas
 * Todas las funciones están adaptadas para el formato español
 */

/**
 * Formatea una cadena de fecha (YYYY-MM-DD) a un formato más legible en español
 * @param fechaString - Cadena de fecha en formato YYYY-MM-DD
 * @returns Fecha formateada en español (ej. "lun., 15 ene. 2023")
 */
export const formatearFechaMostrar = (fechaString: string): string => {
  if (!fechaString || typeof fechaString !== 'string') return '';

  try {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const fecha = new Date(fechaString);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.warn('Fecha inválida:', fechaString);
      return '';
    }

    return fecha.toLocaleDateString('es-ES', opciones);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
};

/**
 * Formatea una cadena de hora (HH:MM o HH:MM:SS) a un formato más legible en español
 * @param horaString - Cadena de hora en formato HH:MM o HH:MM:SS
 * @returns Hora formateada en español (ej. "14:30" o "02:30 p. m.")
 * @param formato12h - Indica si se debe usar formato de 12 horas (true) o 24 horas (false)
 */
export const formatearHora = (
  horaString: string,
  formato12h = true
): string => {
  if (!horaString || typeof horaString !== 'string') return '';

  try {
    // Si horaString incluye segundos (HH:MM:SS), eliminar los segundos
    const partesTiempo = horaString.split(':');
    if (partesTiempo.length > 2) {
      horaString = `${partesTiempo[0]}:${partesTiempo[1]}`;
    }

    // Validar formato de hora
    if (!/^\d{1,2}:\d{2}$/.test(horaString)) {
      console.warn('Formato de hora inválido:', horaString);
      return horaString;
    }

    // Crear un objeto de fecha usando la fecha de hoy y la cadena de hora
    const hoy = new Date();
    const [horas, minutos] = horaString.split(':').map(Number);

    // Validar horas y minutos
    if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
      console.warn('Valores de hora inválidos:', horaString);
      return horaString;
    }

    hoy.setHours(horas, minutos, 0, 0);

    return hoy.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: formato12h,
    });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return horaString; // Devolver la cadena original si falla el análisis
  }
};

/**
 * Formatea un objeto de fecha para mostrar en encabezados
 * @param fecha - Objeto Date a formatear
 * @returns Fecha formateada en español (ej. "lunes, 15 de enero de 2023")
 */
export const formatearFecha = (fecha: Date): string => {
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
    console.warn('Objeto de fecha inválido');
    return '';
  }

  try {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };

    return fecha.toLocaleDateString('es-ES', opciones);
  } catch (error) {
    console.error('Error al formatear fecha completa:', error);
    return '';
  }
};

/**
 * Formatea una fecha para solicitudes API (YYYY-MM-DD)
 * @param fecha - Objeto Date a formatear
 * @returns Cadena de fecha en formato YYYY-MM-DD
 */
export const formatearFechaParaAPI = (fecha: Date): string => {
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
    console.warn('Objeto de fecha inválido para API');
    return '';
  }

  try {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  } catch (error) {
    console.error('Error al formatear fecha para API:', error);
    return '';
  }
};

/**
 * Formatea una cadena de fecha ISO a un formato legible en español
 * @param cadenaISO - Cadena de fecha en formato ISO
 * @returns Fecha y hora formateadas en español (ej. "15 de enero de 2023, 14:30")
 * @param incluirHora - Indica si se debe incluir la hora en el resultado
 */
export const formatearFechaDesdeISO = (
  cadenaISO: string,
  incluirHora = true
): string => {
  if (!cadenaISO || typeof cadenaISO !== 'string') return '';

  try {
    const fecha = new Date(cadenaISO);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.warn('Cadena ISO inválida:', cadenaISO);
      return '';
    }

    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(incluirHora
        ? {
            hour: '2-digit',
            minute: '2-digit',
          }
        : {}),
    };

    return fecha.toLocaleDateString('es-ES', opciones);
  } catch (error) {
    console.error('Error al formatear fecha ISO:', error);
    return '';
  }
};

/**
 * Obtiene la fecha actual formateada para la API (YYYY-MM-DD)
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const obtenerFechaActualParaAPI = (): string => {
  return formatearFechaParaAPI(new Date());
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param fecha1 - Primera fecha (objeto Date o string en formato YYYY-MM-DD)
 * @param fecha2 - Segunda fecha (objeto Date o string en formato YYYY-MM-DD)
 * @returns Número de días de diferencia (valor absoluto)
 */
export const calcularDiferenciaDias = (
  fecha1: Date | string,
  fecha2: Date | string = new Date()
): number => {
  try {
    // Convertir a objetos Date si son strings
    const primeraFecha = fecha1 instanceof Date ? fecha1 : new Date(fecha1);
    const segundaFecha = fecha2 instanceof Date ? fecha2 : new Date(fecha2);

    // Verificar si las fechas son válidas
    if (isNaN(primeraFecha.getTime()) || isNaN(segundaFecha.getTime())) {
      console.warn('Fechas inválidas para calcular diferencia');
      return 0;
    }

    // Eliminar la parte de la hora para comparar solo fechas
    const fecha1SinHora = new Date(primeraFecha.setHours(0, 0, 0, 0));
    const fecha2SinHora = new Date(segundaFecha.setHours(0, 0, 0, 0));

    // Calcular diferencia en milisegundos y convertir a días
    const diferenciaMilisegundos = Math.abs(
      fecha1SinHora.getTime() - fecha2SinHora.getTime()
    );
    return Math.round(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error al calcular diferencia de días:', error);
    return 0;
  }
};

/**
 * Verifica si una fecha está en el pasado
 * @param fecha - Fecha a verificar (objeto Date o string en formato YYYY-MM-DD)
 * @returns true si la fecha está en el pasado, false en caso contrario
 */
export const esFechaEnPasado = (fecha: Date | string): boolean => {
  try {
    const fechaComparar = fecha instanceof Date ? fecha : new Date(fecha);

    // Verificar si la fecha es válida
    if (isNaN(fechaComparar.getTime())) {
      console.warn('Fecha inválida para verificar si está en el pasado');
      return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaComparar.setHours(0, 0, 0, 0);

    return fechaComparar < hoy;
  } catch (error) {
    console.error('Error al verificar si la fecha está en el pasado:', error);
    return false;
  }
};
