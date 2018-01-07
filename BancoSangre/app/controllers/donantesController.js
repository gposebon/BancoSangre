"use strict";
app.controller("donantesController", function ($scope, donantesRepositorio, modalServicio) {
	init();

	function obtenerParametroPorNombre(nombre) {
		var url = window.location.href;
		nombre = nombre.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + nombre + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return "";
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	function init() {
		$scope.donacion = obtenerParametroPorNombre("accion") === "donacion";
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
				$scope.infoPagina.totalItems = result.data.cantidad;
			});
	}

	$scope.removerDonante = function (id) {
		donantesRepositorio.remover(id)
			.then(function (result) {
				if (result.data.toString() === "true") {
					var i;
					for (i = 0; i < $scope.donantes.length; ++i) {
						if ($scope.donantes[i].IdDonante === id) {
							$scope.donantes.splice(i, 1);
							break;
						}
					}
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

	$scope.obtenerClaseBoton = function() {
		return "btn btn-primary glyphicon glyphicon-"  + ($scope.donacion ? "tint" : "pencil");
	}

});