"use strict";
app.factory("preguntasRepositorio", function ($http) {
	return {
		obtenerPreguntas: function () {
			var url = "/Preguntas/ObtenerPreguntas";
			return $http.get(url);
		},
		remover: function (id) {
			var url = "/Preguntas/RemoverPregunta";
			return $http.post(url, { 'id': id });
		},
		guardar: function (pregunta) {
			var url = "/Preguntas/GuardarPregunta";
			return $http.post(url, pregunta);
		},
		actualizarOrden: function (preguntaMovida, preguntaSolapa) {
			var url = "/Preguntas/ActualizarOrdenPreguntas";
			return $http.post(url, { 'preguntaMovida': preguntaMovida, 'preguntaSolapa': preguntaSolapa });
		}
	};
});