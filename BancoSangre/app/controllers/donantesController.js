﻿"use strict";
app.controller("donantesController", function ($scope, donantesRepositorio, modalServicio, $window) {
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
			$scope.donacion = obtenerParametroPorNombre("accion") === "donacion";
			configPaginacion();
			obtenerDonantes();
		} else {
			obtenerDonante();
		}
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

	//Grilla

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

	$scope.obtenerClaseBoton = function () {
		return "btn btn-primary glyphicon glyphicon-" + ($scope.donacion ? "tint" : "pencil");
	}

	//Creación y edición

	function obtenerDonante() {
		donantesRepositorio.obtenerDonante($scope.idDonante)
			.then(function (result) {
				$scope.donante = result.data.data.Donante;
				$scope.tiposDocumentos = result.data.data.TiposDocumentos;
				$scope.gruposFactores = result.data.data.GruposFactores;
				$scope.provincias = result.data.data.Provincias;
				$scope.localidades = result.data.data.Localidades;
				$scope.estadosDonantes = result.data.data.EstadosDonantes;
				cargarCalendarios();
				calcularEdad();
			});
	}

	$scope.calcularEdad = function () {
		var fechaNac = $("#calendarioFechaNacimiento").datepicker("getDate");

		if (fechaNac != null) {
			var edad = "";
			var hoy = new Date(Date.now());
			var anioHoy = hoy.getFullYear();
			var mesHoy = hoy.getMonth();
			var diaHoy = hoy.getDate();
			var anioNac = fechaNac.getFullYear();
			var mesNac = fechaNac.getMonth();
			var diaNac = fechaNac.getDate();
			var dif = anioHoy - anioNac;
			if (mesNac > mesHoy) dif--;
			else {
				if (mesNac === mesHoy) {
					if (diaNac > diaHoy) dif--;
				}
			}
			if (dif !== -1)
				edad = dif;

			$scope.donante.Edad = edad;
		}
	}

	function cargarCalendarios() {
		$("#calendarioFechaNacimiento").datepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: "dd/mm/yy",
			yearRange: "-90:c"
		});

		$("#calendarioDiferidoHasta").datepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: "dd/mm/yy",
			yearRange: "c:c+10"
		});

		var fechaNac = new Date(parseInt($scope.donante.FechaNacimiento.replace("/Date(", "").replace(")/", "")));
		$("#calendarioFechaNacimiento").val(fechaNac.getDate() + "/" + (fechaNac.getMonth() + 1) + "/" + fechaNac.getFullYear());
		var diferido = new Date(parseInt($scope.donante.DiferidoHasta.replace("/Date(", "").replace(")/", "")));
		$("#calendarioDiferidoHasta").val(diferido.getDate() + "/" + (diferido.getMonth() + 1) + "/" + diferido.getFullYear());
	}
	
	$scope.obtenerLocalidades = function () {
		$scope.donante.IdLocalidad = -2;

		donantesRepositorio.obtenerLocalidades($scope.donante.IdProvincia)
			.then(function (result) {
				$scope.localidades = result.data;
			});
	}

	function crearDonante() {
		return {
			IdDonante: $scope.donante.IdDonante,
			IdTipoDoc: $scope.donante.IdTipoDoc,
			NroDoc: $scope.donante.NroDoc,
			Apellido: $scope.donante.Apellido,
			Nombre: $scope.donante.Nombre,
			IdGrupoFactor: $scope.donante.IdGrupoFactor,
			Domicilio: $scope.donante.Domicilio,
			IdProvincia: $scope.donante.IdProvincia,
			IdLocalidad: $scope.donante.IdLocalidad,
			IdEstadoDonante: $scope.donante.IdEstadoDonante,
			DiferidoHasta: $("#calendarioDiferidoHasta").datepicker("getDate"),
			RegistroFHA: $scope.donante.RegistroFHA,
			NumeroRegistroFHA: $scope.donante.NumeroRegistroFHA,
			RegistroRP: $scope.donante.RegistroRP,
			NumeroRegistroRP: $scope.donante.NumeroRegistroRP,
			RegistroRR: $scope.donante.RegistroRR,
			NumeroRegistroRR: $scope.donante.NumeroRegistroRR,
			LugarNacimiento: $scope.donante.LugarNacimiento,
			Telefono: $scope.donante.Telefono,
			FechaNacimiento: $("#calendarioFechaNacimiento").datepicker("getDate"),
			Fecha: $scope.donante.Fecha,
			Ocupacion: $scope.donante.Ocupacion,
		}
	}

	$scope.guardar = function (crearCuestionario) {
		if ($scope.donante.IdTipoDoc === -1 || $scope.donante.NroDoc === "" || $scope.donante.Apellido === "" || $scope.donante.Nombre === "" || $scope.donante.IdGrupoFactor === -1 ||
			$scope.donante.IdProvincia === -1 || $scope.donante.IdLocalidad === -2 || ($scope.donante.IdLocalidad === -1 && $scope.donante.OtraLocalidad === "") ||
			$scope.donante.IdEstadoDonante === -1) {

			$scope.validar = true;
		}

		var donante = crearDonante();
		donantesRepositorio.guardar(donante, $scope.donante.OtraLocalidad)
			.then(function (result) {
				if (result.data.resultado) {
					modalServicio.open("success", "El donante se ha guardado con éxito.");
					if (crearCuestionario)
						$window.location.href = "/Cuestionarios/Cuestionario?idDonante=" + result.data.data + "&accion=crear";
					else
						$window.location.href = "/Donantes/Grilla";
				}
				else {
					modalServicio.open("danger", "Error al guardar el donante.");
				}
			});
	};

});