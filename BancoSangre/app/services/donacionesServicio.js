"use strict";
app.factory("donacionesRepositorio", function ($http) {
	return {
		ObtenerDonaciones: function () {
			var url = "/Donaciones/ObtenerDonaciones";
			return $http.get(url);
		}
	};
});