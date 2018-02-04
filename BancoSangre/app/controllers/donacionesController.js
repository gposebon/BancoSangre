"use strict";

app.controller("donacionesController", function ($scope, donacionesRepositorio, modalServicio, $window) {
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
		$scope.idDonante = obtenerParametroPorNombre("idDonante");
		if ($scope.idDonante === null) {
			configPaginacion();
			obtenerDonaciones();
		} else {
			cargarCalendario();
			obtenerDonacionEnBlanco();
		}
	}

	function obtenerDonaciones() {
		donacionesRepositorio.obtenerDonaciones()
			.then(function (result) {
				$scope.donaciones = result.data !== "" ? result.data.data : [];
				$scope.infoPagina.totalItems = result.data.cantidad;
			});
	}

	function obtenerDonacionEnBlanco() {
		donacionesRepositorio.obtenerDonacionEnBlanco($scope.idDonante)
			.then(function (result) {
				$scope.donacion = result.data.data.Donacion;
				$scope.destinos = result.data.data.Destinos;
			});
	}

	function cargarCalendario() {
		$("#calendarioFecha").datepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: "dd/mm/yy",
			yearRange: "c-5:c+10"
		});
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 11,
			reversa: false,
			totalItems: 0
		};
	}

	$scope.obtenerNroRegistro = function () {
		$scope.validaciones = false;
		$scope.donacion.NroRegistro = "";

		if ($scope.donacion.IdDestino !== "") {
			donacionesRepositorio.obtenerNroRegistro($scope.donacion.IdDestino)
				.then(function (result) {
					$scope.donacion.NroRegistro = result.data;
				});
		}
	};

	function crearDonacion() {
		return {
			NroRegistro: $scope.donacion.NroRegistro,
			IdDonante: $scope.donacion.IdDonante,
			IdDestino: $scope.donacion.IdDestino,
			Material: $scope.donacion.Material,
            Cantidad: $scope.donacion.Cantidad,
            Peso: $scope.donacion.Peso,
			Fecha: $("#calendarioFecha").datepicker("getDate")
		}
	}

	$scope.guardar = function () {
		if ($scope.donacion.NroRegistro === "" || $scope.donacion.IdDestino === "-1") {
			$scope.validaciones = true;
			return;
		}

		var donacion = crearDonacion();
		donacionesRepositorio.guardar(donacion)
			.then(function (result) {
				if (result.data) {
					modalServicio.open("success", "La donación se ha guardado con éxito.");
					$window.location.href = "/Donaciones/Grilla";
				}
				else {
					modalServicio.open("danger", "Error al guardar la donación.");
				}
			});
	};

});