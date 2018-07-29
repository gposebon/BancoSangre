"use strict";

app.controller("donacionesController", function ($scope, donacionesRepositorio, modalServicio, serologiaRepositorio, $window, $uibModal) {
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
        var idDonante = obtenerParametroPorNombre("idDonante");
        if (idDonante == null) { // Grilla
            recuperarFiltro();
            configPaginacion();
            obtenerDonaciones();
            obtenerResultadosSerologia();
        } else { // Nueva donación
            cargarCalendario();
            obtenerDonacionEnBlanco(idDonante);
            $scope.idCuestionario = obtenerParametroPorNombre("idCuestionario");
        }
    }

    function recuperarFiltro() {
        // Si el usuario viene desde el menú principal eliminamos la cookie de búsqueda por documento.
        if (document.referrer.includes('Menu'))
            localStorage.removeItem("busqDocumento");

        var tipoDoc = obtenerParametroPorNombre("tipoDoc");
        var nroDoc = obtenerParametroPorNombre("nroDoc");
        // Si viene en url el tipo y número de doc lo tomamos de ahí porque viene desde Donante (donaciones anteriores)
        if (tipoDoc != null && nroDoc != null) {
            $scope.busqDocumento = tipoDoc + ": " + nroDoc;
        } else { 
            // De lo contrario, valida valores de búsqueda anteriores (en cookie)
            if (localStorage.getItem("busqDocumento") != null) $scope.busqDocumento = localStorage.getItem("busqDocumento");
        }
    }

    //Guardar filtro - En _LoginPartial.cshtml removemos la cookie.
    $scope.$watch("busqDocumento", function () {
        if ($scope.busqDocumento !== undefined) localStorage.setItem("busqDocumento", $scope.busqDocumento); // Sólo para grilla
    });

    function obtenerDonaciones() {
        donacionesRepositorio.obtenerDonaciones()
            .then(function (result) {
                $scope.donaciones = result.data !== "" ? result.data.data : [];
                $scope.infoPagina.totalItems = result.data.cantidad;
                $scope.estadosDonacion = result.data.EstadosDonacion;
            });
    }

    function obtenerDonacionEnBlanco(idDonante) {
        donacionesRepositorio.obtenerDonacionEnBlanco(idDonante)
            .then(function (result) {
                $scope.donacion = result.data.Donacion;
                $scope.destinos = result.data.Destinos;
                $scope.estadosDonacion = result.data.EstadosDonacion;
            });
    }

    function cargarCalendario() {
        $.datepicker.setDefaults($.datepicker.regional['es']);

        $("#calendarioFecha").datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "dd/mm/yy",
            yearRange: "c-5:c+10"
        }).mask("99/99/9999");
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

    function crearDonacion(nroRegistro, idDonante, idDestino, material, cantidad, peso, fecha, idEstadoDonacion, idCuestionario) {
        return {
            NroRegistro: nroRegistro,
            IdDonante: idDonante,
            IdDestino: idDestino,
            Material: material,
            Cantidad: cantidad,
            Peso: peso,
            Fecha: fecha,
            IdEstadoDonacion: idEstadoDonacion,
            IdCuestionario: idCuestionario
        }
    }

    // Pantalla ingresar
    $scope.guardar = function () {
        if ($scope.donacion.NroRegistro === "" || $scope.donacion.IdDestino === "-1") {
            $scope.validaciones = true;
            return;
        }

        var donacion = crearDonacion($scope.donacion.NroRegistro, $scope.donacion.IdDonante, $scope.donacion.IdDestino, $scope.donacion.Material,
            $scope.donacion.Cantidad, $scope.donacion.Peso, $("#calendarioFecha").datepicker("getDate"), $scope.donacion.IdEstadoDonacion, $scope.idCuestionario);
        donacionesRepositorio.guardar(donacion)
            .then(function (result) {
                if (result.data) {
                    modalServicio.open("success", "La donación se ha guardado con éxito.");
                    $window.location.href = "/Cuestionarios/Cuestionario?idCuestionario=" + $scope.idCuestionario + "&accion=editarLuegoDonacion";
                }
                else {
                    modalServicio.open("danger", "Error al guardar la donación.");
                }
            });
    };

    // Grilla
    $scope.actualizarDonacion = function (data, nroRegistro) {

        donacionesRepositorio.actualizarDonacion(nroRegistro, data.idEstadoDonacion)
            .then(function (result) {
                if (result.data) {
                    obtenerDonaciones();
                    modalServicio.open("success", "La donación se ha actualizado con éxito.");
                }
                else {
                    modalServicio.open("danger", "Error al actualizar la donación.");
                }
            });
    };

    $scope.editarSerologia = function (donacion) {
        var instancia = abrirPopupSerologia("/app/modal/modalSerologia.html", "Serologías para donación: " + donacion.NroRegistro, donacion.NroRegistro,
                                                $scope.resultadosSerologia, "", null);
        instancia.result.then(function () {
            obtenerDonaciones();
        }, function () {
            obtenerDonaciones();
        });
    };

    function abrirPopupSerologia(url, texto, nroRegistroDonacion, resultadosSerologia, modo, dimensiones) {
        var ctrlr = function ($scope, $uibModalInstance, datos) {

            var initModal = function () {
                obtenerSerologiasParaDonacion(nroRegistroDonacion);
                $scope.modalTmpStep = {
                    pos: 0,
                    body: ""
                };
                $scope.datos = datos;
            };

            $scope.listo = function () {
                $uibModalInstance.close();
            }

            $scope.actualizarSerologiaParaDonacion = function (data, nroRegistro, idExamenSerologico) {
                serologiaRepositorio.actualizarSerologiaParaDonacion(nroRegistro, idExamenSerologico, data.idResultadoSerologia)
                    .then(function (result) {
                        if (result.data) {
                            obtenerSerologiasParaDonacion(nroRegistro);
                            modalServicio.open("success", "El examen serológico se ha actualizado con éxito.");
                        }
                        else {
                            modalServicio.open("danger", "Error al actualizar el examen serológico.");
                        }
                    });
            };

            function obtenerSerologiasParaDonacion(nroRegistro) {
                donacionesRepositorio.obtenerSerologiasParaDonacion(nroRegistro)
                    .then(function (resultado) {
                        if (resultado.data.resultado) {
                            $scope.serologias = resultado.data.datos;
                        } else {
                            modalServicio.open("danger", "Error al obtener serologías.");
                        }
                    });
            }

            initModal();
        };

        return $uibModal.open({
            animation: true,
            templateUrl: url,
            controller: ctrlr,
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            size: dimensiones != null ? dimensiones : "lg",
            resolve: {
                datos: function () {
                    return {
                        texto: texto,
                        modo: modo,
                        resultadosSerologia: resultadosSerologia
                    };
                }
            }
        });
    }

    $scope.obtenerClaseSerologia = function (tieneSerologia) {
        var clase = tieneSerologia ? "btn btn-primary" : "btn btn-success";
        return clase + " fa fa-flask";
    }

    function obtenerResultadosSerologia() {
        serologiaRepositorio.obtenerResultadosSerologia()
            .then(function (resultado) {
                $scope.resultadosSerologia = resultado.data !== "" ? resultado.data.datos : [];
            });
    }

});