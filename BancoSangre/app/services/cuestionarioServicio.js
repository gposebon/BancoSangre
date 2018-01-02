"use strict";
app.factory("cuestionarioRepositorio", function ($http) {
	return {
		ObtenerCuestionarioParaDonante: function (idDonante) {
			var url = "/Cuestionarios/ObtenerCuestionarioParaDonante";
			return $http.get(url + "?idDonante=" + idDonante);
		},
		ObtenerCuestionarioPorId: function (idCuestionario) {
			var url = "/Cuestionarios/ObtenerCuestionarioPorId";
			return $http.get(url + "?idCuestionario=" + idCuestionario);
		},
		ObtenerCuestionariosDeDonante: function (idDonante) {
			var url = "/Cuestionarios/ObtenerCuestionariosDeDonante";
			return $http.get(url + "?idDonante=" + idDonante);
		},
		guardar: function (cuestionarioDonante) {
			var url = "/Cuestionarios/GuardarCuestionarioParaDonante";
			return $http.post(url, cuestionarioDonante);
		}
	};
});