"use strict";
app.factory("serologiaRepositorio", function ($http) {
	return {
		obtenerExamenes: function () {
            var url = "/ExamenesSerologicos/ObtenerExamenes";
			return $http.get(url);
		},
		remover: function (id) {
            var url = "/ExamenesSerologicos/RemoverExamen";
			return $http.post(url, { 'id': id });
		},
		guardar: function (examen) {
            var url = "/ExamenesSerologicos/GuardarExamen";
			return $http.post(url, examen);
        },
        obtenerResultadosSerologia: function () {
            var url = "/ExamenesSerologicos/ObtenerResultadosSerologia";
            return $http.get(url);
        },
        actualizarSerologiaParaDonacion: function (nroRegistro, idExamenSerologico, idResultadoSerologia) {
            var url = "/ExamenesSerologicos/ActualizarSerologiaParaDonacion";
            return $http.post(url, { 'nroRegistro': nroRegistro, 'idExamenSerologico': idExamenSerologico, 'idResultadoSerologia': idResultadoSerologia });
        }
	};
});