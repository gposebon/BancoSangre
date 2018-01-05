"use strict";

app.controller("cuestionarioController", function ($scope, cuestionarioRepositorio, modalServicio, $window) {
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
		$scope.idDonante = obtenerParametroPorNombre("idDonante", null);
		var idCuestionario = obtenerParametroPorNombre("idCuestionario", null);
		var accion = obtenerParametroPorNombre("accion", null);
		switch (accion) {
			case "crear":
				$scope.editar = true;
				$scope.linkVolver = "/Donantes/Edit?id=" + $scope.idDonante;
				obtenerCuestionarioEnBlanco();
				break;
			case "vistaPrevia":
				$scope.editar = false;
				$scope.linkVolver = "/Preguntas/Index";
				obtenerCuestionarioEnBlanco(-1);
				break;
			case "ver":
				$scope.editar = false;
				$scope.linkVolver = "/Cuestionarios/CuestionariosExistentes?idDonante=" + $scope.idDonante + "&accion=listar";
				obtenerCuestionarioPorId(idCuestionario);
				break;
			case "listar":
				$scope.linkVolver = "/Donantes/Edit?id=" + $scope.idDonante;
				configPaginacion();
				obtenerCuestionariosDeDonante();
				break;
		}
	}

	function obtenerCuestionarioEnBlanco() {
		if ($scope.idDonante !== null) {
			cuestionarioRepositorio.ObtenerCuestionarioParaDonante($scope.idDonante)
				.then(function (result) {
					$scope.datosDemograficos = result.data !== "" ? result.data.data.DatosDemograficos : [];
					$scope.preguntas = result.data !== "" ? result.data.data.Preguntas : [];
					$scope.fecha = result.data !== "" ? result.data.data.Fecha : "";
				});
		}
	}

	function obtenerCuestionarioPorId(idCuestionario) {
		if (idCuestionario !== null) {
			cuestionarioRepositorio.ObtenerCuestionarioPorId(idCuestionario)
				.then(function (result) {
					$scope.datosDemograficos = result.data !== "" ? result.data.data.DatosDemograficos : [];
					$scope.fecha = result.data !== "" ? result.data.data.Fecha : "";
					$scope.preguntas = result.data !== "" ? result.data.data.Preguntas : [];
					//Las respuestas (abiertas y encriptadas) se persisten encripatas en BD. VUelven como string, las pasamos a bool.
					var i;
					for (i = 0; i < $scope.preguntas.length; ++i) {
						if ($scope.preguntas[i].RespuestaCerrada !== null) {
							var esVerdadero = ($scope.preguntas[i].RespuestaCerrada === "True");
							$scope.preguntas[i].RespuestaCerrada = esVerdadero;
						}
					}
				});
		}
	}

	function obtenerCuestionariosDeDonante() {
		if ($scope.idDonante !== null) {
			cuestionarioRepositorio.ObtenerCuestionariosDeDonante($scope.idDonante)
				.then(function (result) {
					$scope.donante = result.data !== "" ? result.data.data.Donante : [];
					$scope.cuestionarios = result.data !== "" ? result.data.data.Cuestionarios : [];
					$scope.infoPagina.totalItems = result.data.cantidad;
				});
		}
	}

	function crearObjetoCuestionario(datosDemograficos, preguntas, fecha) {
		return {
			IdDonante: $scope.idDonante,
			DatosDemograficos: datosDemograficos,
			Preguntas: preguntas,
			Fecha: fecha
		}
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 9,
			reversa: false,
			totalItems: 0
		};
	}

	$scope.guardarCuestionario = function (accion) {
		var cuestionario = crearObjetoCuestionario($scope.datosDemograficos, $scope.preguntas, $scope.fecha);
		cuestionarioRepositorio.guardar(cuestionario)
			.then(function (result) {
				if (result.data) {
					$scope.editar = false;
					modalServicio.open("success", "El cuestionario se ha guardado con éxito.");
					if (accion === "imprimir")
						imprimirCuestionario();
					if (accion === "donacion")
						$window.location.href = "/Donaciones/Ingresar?idDonante=" + $scope.idDonante;
				}
				else {
					modalServicio.open("danger", "Error al guardar el cuestionario.");
				}
			});
	};

	$scope.imprimirCuestionario = function() {
		imprimirCuestionario();
	}

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