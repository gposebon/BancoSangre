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
			itemsPorPagina: 6,
			reversa: false,
			totalItems: 0,
			textoBusqueda: ""
		};
	}

	function obtenerDonantes() {
		donantesRepositorio.obtenerDonantes($scope.infoPagina)
			.then(function (result) {
				$scope.donantes = result.data.data;
				$scope.infoPagina.totalItems = result.data.count;
			});
	}

	$scope.seleccionarPagina = function () {
		obtenerDonantes();
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

	$scope.buscar = function (descripcion) {
		$scope.infoPagina.textoBusqueda = descripcion;
		obtenerDonantes();
	};

});