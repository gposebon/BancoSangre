"use strict";
app.factory("cuestionarioRepositorio", function ($http) {
	return {
		obtenerCuestionarioParaDonante: function (idDonante) {
			var url = "/Cuestionarios/ObtenerCuestionarioParaDonante";
			return $http.get(url + "?idDonante=" + idDonante);
		},
		obtenerCuestionarioPorId: function (idCuestionario) {
			var url = "/Cuestionarios/ObtenerCuestionarioPorId";
			return $http.get(url + "?idCuestionario=" + idCuestionario);
		},
		guardar: function (cuestionarioDonante) {
			var url = "/Cuestionarios/GuardarCuestionarioParaDonante";
			return $http.post(url, cuestionarioDonante);
		}
	};
});