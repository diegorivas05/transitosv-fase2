-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-09-2026 a las 23:12:53
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `transitosv`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas`
--

CREATE TABLE `consultas` (
  `id_consulta` int(11) NOT NULL,
  `origen` varchar(150) NOT NULL,
  `destino` varchar(150) NOT NULL,
  `tiempo_estimado` int(11) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rutas`
--

CREATE TABLE `rutas` (
  `id_ruta` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `lista_paradas` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rutas`
--

INSERT INTO `rutas` (`id_ruta`, `nombre`, `lista_paradas`) VALUES
(1, 'Ruta 101-D', 'Santa Tecla, Parque Daniel Hernández, Paseo General Escalón, Redondel Masferrer, Metrocentro, Parque Infantil, Centro Histórico, 4ª Calle Poniente'),
(2, 'Ruta 44', 'Antiguo Cuscatlán, Multiplaza, Redondel Luceiro, Universidad de El Salvador (UES), Redondel Schafik Hándal, Metrocentro, Mercado Central'),
(3, 'Ruta 30', 'Universidad de El Salvador (UES), Plaza de la Salud, Maternidad, Metrocentro, San Jacinto'),
(4, 'Ruta 52 (Escalón)', 'Colonia Escalón, Paseo General Escalón, Redondel Altagracia, Centro de San Salvador, Plaza Mundo'),
(5, 'Ruta 42-B', 'Santa Tecla, Merliot, Carretera Panamericana, Salvador del Mundo, Centro de San Salvador'),
(6, 'Ruta 29-A', 'Soyapango, Plaza Mundo, Boulevard del Ejército, Terminal de Buses del Sur, Centro Histórico');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telemetria`
--

CREATE TABLE `telemetria` (
  `id_registro` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `coordenadas` varchar(100) NOT NULL,
  `velocidad` decimal(5,2) DEFAULT 0.00,
  `id_unidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades_transporte`
--

CREATE TABLE `unidades_transporte` (
  `id_unidad` int(11) NOT NULL,
  `coordenadas` varchar(100) NOT NULL,
  `velocidad` decimal(5,2) DEFAULT 0.00,
  `estado` varchar(50) NOT NULL,
  `id_ruta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `unidades_transporte`
--

INSERT INTO `unidades_transporte` (`id_unidad`, `coordenadas`, `velocidad`, `estado`, `id_ruta`) VALUES
(1, '13.7000, -89.2000', 25.50, 'activo', 1),
(2, '13.6900, -89.1900', 0.00, 'en parada', 2),
(3, '13.6988, -89.2445', 28.50, 'activo', 1),
(4, '13.7012, -89.2150', 15.20, 'en parada', 1),
(5, '13.7000, -89.2000', 35.00, 'activo', 1),
(6, '13.6823, -89.2371', 0.00, 'en parada', 2),
(7, '13.7150, -89.2210', 22.40, 'activo', 2),
(8, '13.7205, -89.2118', 19.80, 'activo', 3),
(9, '13.6950, -89.1920', 0.00, 'inactivo', 3),
(10, '13.7050, -89.2250', 30.10, 'activo', 4),
(11, '13.6990, -89.2310', 12.00, 'en parada', 5),
(12, '13.7020, -89.1980', 25.00, 'activo', 5),
(13, '13.7120, -89.1450', 40.00, 'activo', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `rol` varchar(50) DEFAULT 'pasajero'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `contraseña`, `rol`) VALUES
(1, 'Gabriel Martínez', 'gabriel@transitosv.com', '$2y$10$EjemploContrasenaHashBcrypt', 'admin'),
(2, 'Diego Rivas', 'diego@transitosv.com', '$2y$10$EjemploContrasenaHashBcrypt', 'pasajero');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `consultas`
--
ALTER TABLE `consultas`
  ADD PRIMARY KEY (`id_consulta`),
  ADD KEY `fk_consulta_usuario` (`id_usuario`);

--
-- Indices de la tabla `rutas`
--
ALTER TABLE `rutas`
  ADD PRIMARY KEY (`id_ruta`);

--
-- Indices de la tabla `telemetria`
--
ALTER TABLE `telemetria`
  ADD PRIMARY KEY (`id_registro`),
  ADD KEY `fk_telemetria_unidad` (`id_unidad`);

--
-- Indices de la tabla `unidades_transporte`
--
ALTER TABLE `unidades_transporte`
  ADD PRIMARY KEY (`id_unidad`),
  ADD KEY `fk_unidad_ruta` (`id_ruta`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `consultas`
--
ALTER TABLE `consultas`
  MODIFY `id_consulta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rutas`
--
ALTER TABLE `rutas`
  MODIFY `id_ruta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `telemetria`
--
ALTER TABLE `telemetria`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `unidades_transporte`
--
ALTER TABLE `unidades_transporte`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `consultas`
--
ALTER TABLE `consultas`
  ADD CONSTRAINT `fk_consulta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `telemetria`
--
ALTER TABLE `telemetria`
  ADD CONSTRAINT `fk_telemetria_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_transporte` (`id_unidad`) ON DELETE CASCADE;

--
-- Filtros para la tabla `unidades_transporte`
--
ALTER TABLE `unidades_transporte`
  ADD CONSTRAINT `fk_unidad_ruta` FOREIGN KEY (`id_ruta`) REFERENCES `rutas` (`id_ruta`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
