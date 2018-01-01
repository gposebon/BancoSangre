"use strict";

app.controller("cuestionarioController", function ($scope, cuestionarioRepositorio, modalServicio) {
	init();

	function obtenerParametroPorNombre(nombre, url) {
		if (!url) url = window.location.href;
		nombre = nombre.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + nombre + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return "";
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	function init() {
		obtenerCuestionario(obtenerParametroPorNombre("idDonante", null));
	}

	function obtenerCuestionario(idDonante) {
		if (idDonante !== null) {
			cuestionarioRepositorio.ObtenerCuestionarioParaDonante(idDonante)
				.then(function(result) {
					$scope.preguntas = result.data !== "" ? result.data.data.Preguntas : [];
					$scope.donante = result.data !== "" ? result.data.data.Donante : [];
					$scope.fecha = result.data !== "" ? result.data.data.Fecha : "";
					$scope.editar = true;
				});
		}
	}

	function crearObjetoCuestionario(donante, preguntas, fecha) {
		return {
			Donante: donante,
			Preguntas: preguntas,
			Fecha: fecha
		}
	}

	$scope.guardarCuestionario = function (imprimir) {
		var cuestionario = crearObjetoCuestionario($scope.donante, $scope.preguntas, $scope.fecha);
		cuestionarioRepositorio.guardar(cuestionario)
			.then(function (result) {
				if (result) {
					modalServicio.open("success", "El cuestionario se ha guardado con éxito.");
					if(imprimir)
						imprimirCuestionario();
					$scope.editar = false;
				}
				else {
					modalServicio.open("danger", "Error al guardar el cuestionario.");
				}
			});
	};

	function imprimirCuestionario() {
		$("input").each(function () {
			if ($(this).prop("type") === "radio") {
				$(this).attr("checked", $(this).filter(':checked').val());
			}
		});
		$("textarea").each(function () {
			if ($(this).val() !== null) {
				$(this).html($(this).val());
			}
		});

		var html = "";
		$("link").each(function () {
			if ($(this).attr("rel").indexOf("stylesheet") !== -1) {
				html += '<link rel="stylesheet" href="' + $(this).attr("href") + '" />';
			}
		});

		var contenidoDiv = $("#contenido").html();
		contenidoDiv = contenidoDiv.replace(/placeholder="Respuesta"/g, 'style="border:none; resize:none;"');

		html += '<body onload="window.focus(); window.print()"> ' + contenidoDiv + "</body>";
		var w = window.open("", "print");
		if (w) {
			w.document.write(html);
			w.document.close();
		}
	}

	$scope.obtenerClaseContenedor = function (pregunta) {
		var claseContenedor = "contenedorPreguntaRespuesta" + ((pregunta.LineaCompleta) ? "-LineaEntera" : "");
		if (pregunta.NuevaLinea)
			claseContenedor += " nuevaLinea";
		return claseContenedor;
	}

	$scope.obtenerClasePregunta = function (pregunta) {
		var clasePregunta = "preguntaRespuesta" + ((pregunta.EsTitulo) ? "-Titulo" : "");
		return clasePregunta;
	}

});