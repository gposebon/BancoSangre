"use strict";
app.factory("donantesRepositorio", function ($http) {
	return {
		obtenerDonantes: function () {
			var url = "/Donantes/ObtenerDonantes";
			return $http.get(url);
		},
		remover: function (idDonante) {
			var url = "/Donantes/RemoverDonante";
			return $http.post(url, { 'idDonante': idDonante });
		},
		obtenerDonante: function(idDonante) {
			var url = "/Donantes/ObtenerDonante";
			return $http.get(url+ "?idDonante=" + idDonante);
		},
		obtenerLocalidades: function (idProvincia) {
			var url = "/Donantes/TraerLocalidades";
			return $http.get(url + "?idProvincia=" + idProvincia);
		},
		guardar: function (donante, otraLocalidad) {
			var url = "/Donantes/GuardarDonante";
			return $http.post(url, { 'donante': donante, 'otraLocalidad': otraLocalidad });
        },
        obtenerCausalesDeRechazo: function (idDonante) {
            var url = "/Donantes/ObtenerCausalesDeRechazo";
            return $http.get(url + "?idDonante=" + idDonante);
        }
	};
});