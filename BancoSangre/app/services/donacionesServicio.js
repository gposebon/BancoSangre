"use strict";
app.factory("donacionesRepositorio", function ($http) {
	return {
        obtenerDonaciones: function () {
			var url = "/Donaciones/ObtenerDonaciones";
            return $http.get(url);
		},
		obtenerDonacionEnBlanco: function (idDonante) {
			var url = "/Donaciones/ObtenerDonacionEnBlanco";
			return $http.get(url + "?idDonante=" + idDonante);
		},
		obtenerNroRegistro: function (idDestino) {
			var url = "/Donaciones/ObtenerNroRegistro";
			return $http.get(url + "?idDestino=" + idDestino);
		},
        guardar: function (donacion, imprimirEtiquetas, cantidadEtiquetasExtras) {
			var url = "/Donaciones/Guardar";
            return $http.post(url, { 'donacion': donacion, 'imprimirEtiquetas': imprimirEtiquetas, 'cantidadEtiquetasExtras': cantidadEtiquetasExtras });
        },
        actualizarDonacion: function (nroRegistro, idEstadoDonacion) {
            var url = "/Donaciones/ActualizarDonacion";
            return $http.post(url, { 'nroRegistro': nroRegistro, 'idEstadoDonacion': idEstadoDonacion });
        },
        obtenerSerologiasParaDonacion: function (nroRegistro) {
            var url = "/Donaciones/ObtenerSerologiaParaDonacion";
            return $http.get(url + "?nroRegistro=" + nroRegistro);
        },
        imprimirEtiquetas: function (nroRegistro, cantidadEtiquetasExtras) {
            var url = "/Donaciones/ImprimirEtiquetas";
            return $http.get(url + "?nroRegistro=" + nroRegistro + "&cantidadEtiquetasExtras=" + cantidadEtiquetasExtras);
        }
	};
});