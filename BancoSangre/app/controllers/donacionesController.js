"use strict";

app.controller("donacionesController", function ($scope, donacionesRepositorio) {
	init();

	function init() {
		configPaginacion();
		obtenerDonaciones();
	}

	function obtenerDonaciones() {
		donacionesRepositorio.ObtenerDonaciones()
				.then(function (result) {
					$scope.donaciones = result.data !== "" ? result.data.data : [];
					$scope.infoPagina.totalItems = result.data.cantidad;
				});
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 9,
			reversa: false,
			totalItems: 0
		};
	}

});