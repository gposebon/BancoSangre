"use strict";
app.controller("donantesController", function ($scope, donantesRepositorio, modalServicio) {
	init();

	function init() {
		configPaginacion();
		obtenerDonantes();
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 100,
			reversa: false,
			totalItems: 0
		};
	}

	function obtenerDonantes() {
		donantesRepositorio.obtenerDonantes()
			.then(function (result) {
				$scope.donantes = result.data.data;
				$scope.infoPagina.totalItems = result.data.count;
			});
	}

	$scope.seleccionarPagina = function () {
	}

	$scope.removerDonante = function (index, id) {
		donantesRepositorio.remover(id)
			.then(function (result) {
				if (result.data.toString() === "true") {
					$scope.donantes.splice(index, 1);
					modalServicio.open("success", "El Donante ha sido removido correctamente.");
				}
				else {
					modalServicio.open("danger", result.data);
				}
			});
	};

	$scope.verEstado = function (idEstadoDonante, descripcionEstado, diferidoHasta) {
		var textoSecundario = "";
		if (idEstadoDonante === 2)
			textoSecundario = ": (Razones)";
		if (idEstadoDonante === 3 && diferidoHasta != null)
			textoSecundario = " hasta " + new Date(diferidoHasta.match(/\d+/)[0] * 1).toLocaleDateString() + ". (Razones)";
		modalServicio.open("info", descripcionEstado + textoSecundario);
	}

});