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
		}
		
	};
});