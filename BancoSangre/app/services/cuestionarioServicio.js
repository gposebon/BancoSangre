"use strict";
app.factory("cuestionarioRepositorio", function ($http) {
	return {
		ObtenerCuestionarioParaDonante: function (idDonante) {
			var url = "/Donantes/ObtenerCuestionarioParaDonante";
			return $http.get(url + "?idDonante=" + idDonante);
		},
		guardar: function (cuestionarioDonante) {
			var url = "/Donantes/GuardarCuestionarioParaDonante";
			return $http.post(url, cuestionarioDonante);
		}
	};
});