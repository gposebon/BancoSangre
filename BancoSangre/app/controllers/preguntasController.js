"use strict";

app.controller("preguntasController", function ($scope, preguntasRepositorio, modalServicio) {
	init();

	function init() {
		configCheckMostrar();
		configPaginacion();
		obtenerPreguntas();
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 9,
			reversa: false,
			totalItems: 0
		};
	}

	function obtenerPreguntas() {
		preguntasRepositorio.obtenerPreguntas()
			.then(function (result) {
				$scope.preguntas = result.data !== "" ? result.data.data : [];
				$scope.infoPagina.totalItems = result.data.cantidad;
			});
	}

	function configCheckMostrar() {
		$("#checkMostrar").prop("indeterminate", true).data("checked", 0).on("click",
			function () {
				var el = $(this);

				switch (el.data("checked")) {
					case 0:
						el.data("checked", 1);
						el.prop("indeterminate", false);
						el.prop("checked", true);
						break;
					case 1:
						el.data("checked", 2);
						el.prop("indeterminate", false);
						el.prop("checked", false);
						break;
					default:
						el.data("checked", 0);
						el.prop("indeterminate", true);
						el.prop("checked", false);
				}
			});
	}

	$scope.removerPregunta = function (id) {
		preguntasRepositorio.remover(id)
			.then(function (result) {
				if (result.data.toString() === "true") {
					var i;
					for (i = 0; i < $scope.preguntas.length; ++i) {
						if ($scope.preguntas[i].IdPregunta === id) {
							$scope.preguntas.splice(i, 1);
							break;
						}
					}
					modalServicio.open("success", "La pregunta ha sido removida correctamente.");
				}
				else {
					modalServicio.open("danger", result.data);
				}
			});
	};

	$scope.cancelarPregunta = function (rowform, id) {
		if (id <= 0) {
			var i;
			for (i = 0; i < $scope.preguntas.length; ++i) {
				if ($scope.preguntas[i].IdPregunta === id) {
					$scope.preguntas.splice(i, 1);
					break;
				}
			}
		}
		rowform.$cancel();
	}

	$scope.agregarPregunta = function () {
		$scope.inserted = {
			IdPregunta: 0,
			TextoPregunta: "",
			EsTitulo: false,
			NuevaLinea: false,
			LineaCompleta: false,
			EsCerrada: false,
			CausalRechazo: false,
			Mostrar: false,
			Orden: $scope.preguntas.length + 1
		};
		$scope.preguntas.push($scope.inserted);
	};

	function crearPregunta(id, textoPregunta, esTitulo, nuevaLinea, lineaCompleta, esCerrada, causalRechazo, mostrar, orden) {
		return {
			IdPregunta: id,
			TextoPregunta: textoPregunta,
			NuevaLinea: nuevaLinea,
			EsTitulo: esTitulo,
			LineaCompleta: lineaCompleta,
			EsCerrada: esCerrada,
			CausalRechazo: causalRechazo,
			Mostrar: mostrar,
			Orden: orden
		}
	}

	$scope.guardarPregunta = function (data, id) {
		var pregunta = crearPregunta(id, data.textoPregunta, data.esTitulo, data.nuevaLinea, data.lineaCompleta, data.esCerrada, data.causalRechazo, data.mostrar, data.orden);
		preguntasRepositorio.guardar(pregunta)
			.then(function (result) {
				if (result.data) {
					obtenerPreguntas();
					modalServicio.open("success", "La pregunta se ha guardado con éxito.");
				}
				else {
					modalServicio.open("danger", "Error al guardar la pregunta.");
				}
			});
	};

	function actualizarOrden(preguntaMovida, preguntaSolapa) {
		if (preguntaMovida != null) {
			preguntasRepositorio.actualizarOrden(preguntaMovida, preguntaSolapa)
				.then(function (result) {
					if (result) {
						obtenerPreguntas();
					} else {
						modalServicio.open("danger", "Error al actualizar el orden.");
					}
				});
		}
	}

    $scope.cambiarOrden = function (id, ordenActual) {
        if (ordenActual <= 0) return;

		var i;
		var preguntaMovida = null;
		var preguntaSolapa = null;
		var ordenParaSolapada = 0;
		for (i = 0; i < $scope.preguntas.length; ++i) {
			if ($scope.preguntas[i].IdPregunta === id) {
				preguntaMovida = $scope.preguntas[i];
				ordenParaSolapada = preguntaMovida.Orden;
				preguntaMovida.Orden = ordenActual;
				break;
			}
		}
		for (i = 0; i < $scope.preguntas.length; ++i) {
			if ($scope.preguntas[i].Orden === ordenActual && $scope.preguntas[i].IdPregunta !== id) {
				preguntaSolapa = $scope.preguntas[i];
				preguntaSolapa.Orden = ordenParaSolapada;
				break;
			}
		}

		actualizarOrden(preguntaMovida, preguntaSolapa);
	}

	$scope.filtrar = function () {
		// Siempre filtra por el texto, pero además, si el check de mostrar no está en estado indeterminado también filtramos por ese check.
		var checkMostrarEnIndeterminado = $("#checkMostrar").prop("indeterminate");
		if (!checkMostrarEnIndeterminado) {
			$scope.filtro = { "TextoPregunta": $("#busqTextoPregunta").val(), "Mostrar": $("#checkMostrar").prop("checked") };
		} else {
			$scope.filtro = { "TextoPregunta": $("#busqTextoPregunta").val() };
		}
	};

});