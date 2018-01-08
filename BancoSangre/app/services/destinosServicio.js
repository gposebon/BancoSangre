"use strict";
app.factory("destinosRepositorio", function ($http) {
	return {
		obtenerDestinos: function () {
			var url = "/DestinoDonacions/ObtenerDestinos";
			return $http.get(url);
		},
		remover: function (id) {
			var url = "/DestinoDonacions/RemoverDestino";
			return $http.post(url, { 'id': id });
		},
		guardar: function (destino) {
			var url = "/DestinoDonacions/GuardarDestino";
			return $http.post(url, destino);
		}
		
	};
});