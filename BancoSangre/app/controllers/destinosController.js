"use strict";

app.controller("destinosController", function ($scope, destinosRepositorio, modalServicio) {
	init();

	function init() {
		configPaginacion();
		obtenerDestinos();
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 9,
			reversa: false,
			totalItems: 0
		};
	}

	function obtenerDestinos() {
		destinosRepositorio.obtenerDestinos()
			.then(function (result) {
				$scope.destinos = result.data !== "" ? result.data.data : [];
				$scope.infoPagina.totalItems = result.data.cantidad;
			});
	}
		
	$scope.removerDestino = function (id) {
		destinosRepositorio.remover(id)
			.then(function (result) {
				if (result.data.toString() === "true") {
					var i;
					for (i = 0; i < $scope.destinos.length; ++i) {
						if ($scope.destinos[i].IdDestino === id) {
							$scope.destinos.splice(i, 1);
							break;
						}
					}
					modalServicio.open("success", "El destino ha sido removido correctamente.");
				}
				else {
					modalServicio.open("danger", result.data);
				}
			});
	};

	$scope.cancelarDestino = function (rowform, id) {
		if (id <= 0) {
			var i;
			for (i = 0; i < $scope.destinos.length; ++i) {
				if ($scope.destinos[i].IdDestino === id) {
					$scope.destinos.splice(i, 1);
					break;
				}
			}
		}
		rowform.$cancel();
	}

	$scope.agregarDestino = function () {
		$scope.inserted = {
			IdDestino: 0,
			DescripcionDestino: "",
			Direccion: "",
			Ciudad: "",
			Provincia: "",
			Prefijo: "",
			Telefono: "",
		};
		$scope.destinos.push($scope.inserted);
	};

	function crearDestino(idDestino, descripcionDestino, direccion, ciudad, provincia, prefijo, telefono) {
		return {
			IdDestino: idDestino,
			DescripcionDestino: descripcionDestino,
			Direccion: direccion,
			Ciudad: ciudad,
			Provincia: provincia,
			Prefijo: prefijo,
			Telefono: telefono
		}
	}

	$scope.guardarDestino = function (data, id) {
		var destino = crearDestino(id, data.descripcionDestino, data.direccion, data.ciudad, data.provincia, data.prefijo, data.telefono);
		destinosRepositorio.guardar(destino)
			.then(function (result) {
				if (result.data.resultado) {
					obtenerDestinos();
					modalServicio.open("success", "El destino se ha guardado con éxito.");
				}
				else {
					modalServicio.open("danger", result.data.data);
				}
			});
	};
		
    $scope.validarVacio = function (data) {
        if (data === undefined || data == '') {
            return "Campo requerido.";
        }
    };

    $scope.validarPrefijo = function (idDestino, data) {
        var respuesta = $scope.validarVacio(data);
        if (respuesta !== undefined) return respuesta;
        for (var i = 0; i < $scope.destinos.length; i++) {
            if ($scope.destinos[i].IdDestino != idDestino && $scope.destinos[i].Prefijo.toUpperCase() == data.toUpperCase())
                return "Prefijo existente.";
        }
    };

});