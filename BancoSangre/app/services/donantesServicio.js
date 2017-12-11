"use strict";
app.factory("donantesRepositorio", function ($http) {
	return {
		obtenerDonantes: function () {
			var url = "/Donantes/ObtenerDonantes";
			return $http.get(url);
		},
		remover: function (id) {
			var url = "/Donantes/RemoverDonante";
			return $http.post(url, { 'id': id });
		}
	};
});