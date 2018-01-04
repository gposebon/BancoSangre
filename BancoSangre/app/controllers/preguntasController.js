"use strict";

app.controller("preguntasController", function ($scope, preguntasRepositorio, modalServicio) {
	init();

	function init() {
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
				$scope.infoPagina.totalItems = result.data.count;
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

	$scope.filtrar = function (llamaDesdeCheckMostrar) {
		// DESDE CHECK: Como el indeterminate se actualiza luego de filtrar no lo podemos usar en el if, tomamos el valor (tb desactualizado) de "data("checked")", si este es 2 sabemos que 
		// indeterminado terminará en true. Estamos yendo del check deschequeado al indeterminado.
		// DESDE CAJA DE TEXTO: Aquí el indeterminate está siempre actualizado pero utilizamos el mismo valor "data("checked")", tb actualizado.
		var estadoCheckMostrar = $("#checkMostrar").data("checked");
		if (llamaDesdeCheckMostrar && estadoCheckMostrar !== 2 || !llamaDesdeCheckMostrar && estadoCheckMostrar !== 0) {
			$scope.filtro = { "TextoPregunta": $("#busqTextoPregunta").val(), "Mostrar": $("#checkMostrar").prop("checked") };
		} else {
			$scope.filtro = { "TextoPregunta": $("#busqTextoPregunta").val() };
		}
	};

});