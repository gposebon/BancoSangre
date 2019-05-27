"use strict";

app.controller("serologiaController", function ($scope, serologiaRepositorio, modalServicio) {
	init();

	function init() {
		configPaginacion();
		obtenerExamenes();
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 9,
			reversa: false,
			totalItems: 0
		};
	}

	function obtenerExamenes() {
        serologiaRepositorio.obtenerExamenes()
			.then(function (resultado) {
                $scope.examenes = resultado.data !== "" ? resultado.data.data : [];
                $scope.infoPagina.totalItems = resultado.data.cantidad;
			});
	}
		
	$scope.removerExamen = function (id) {
        serologiaRepositorio.remover(id)
			.then(function (resultado) {
                if (resultado.data.toString() === "true") {
					var i;
					for (i = 0; i < $scope.examenes.length; ++i) {
						if ($scope.examenes[i].IdExamenSerologico === id) {
							$scope.examenes.splice(i, 1);
							break;
						}
					}
					modalServicio.open("success", "El examen ha sido removido correctamente.");
				}
				else {
					modalServicio.open("danger", resultado.data);
				}
			});
	};

    $scope.cancelarExamen = function (rowform, id) {
        if (id <= 0) {
            var i;
            for (i = 0; i < $scope.examenes.length; ++i) {
                if ($scope.examenes[i].IdExamenSerologico === id) {
                    $scope.examenes.splice(i, 1);
                    break;
                }
            }
        }
        rowform.$cancel();
    };

	$scope.agregarExamen = function () {
		$scope.inserted = {
            IdExamenSerologico: 0,
            DescripcionExamen: "",
            EstaActivo: false
		};
		$scope.examenes.push($scope.inserted);
	};

    function crearExamen(idExamenSerologico, descripcionExamen, estaActivo) {
        return {
            IdExamenSerologico: idExamenSerologico,
            DescripcionExamen: descripcionExamen,
            EstaActivo: estaActivo
        };
	}

	$scope.guardarExamen = function (data, id) {
        var examen = crearExamen(id, data.descripcionExamen, data.estaActivo);
		serologiaRepositorio.guardar(examen)
			.then(function (resultado) {
                if (resultado.data.resultado) {
					obtenerExamenes();
					modalServicio.open("success", "El examen se ha guardado con éxito.");
				}
				else {
                    modalServicio.open("danger", resultado.data.data);
				}
			});
	};
		
    $scope.validarVacio = function (data) {
        if (data === undefined || data === '') {
            return "Campo requerido.";
        }
    };

});