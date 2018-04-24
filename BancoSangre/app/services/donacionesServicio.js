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
		guardar: function (donacion) {
			var url = "/Donaciones/Guardar";
			return $http.post(url, donacion);
        },
        actualizarDonacion: function (nroRegistro, idEstadoDonacion) {
            var url = "/Donaciones/ActualizarDonacion";
            return $http.post(url, { 'nroRegistro': nroRegistro, 'idEstadoDonacion': idEstadoDonacion });
        }
	};
});