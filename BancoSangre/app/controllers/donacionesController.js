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
        if (idDonante === null) { // Grilla
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
        };
    }

    // Pantalla ingresar
    
    $scope.impresionEtiquetas = function () {
        abrirPopupEtiquetas("/app/modal/modalEtiquetas.html", "¿Desea imprimir etiquetas?", "", null, $scope.donacion, $scope.idCuestionario);
    };

    function abrirPopupEtiquetas(url, texto, modo, dimensiones, donacionScope, idCuestionario) {
        var ctrlr = function ($scope, $uibModalInstance, datos) {

            var initModal = function () {
                $scope.modalTmpStep = {
                    pos: 0,
                    body: ""
                };
                $scope.datos = datos;
            };

            $scope.guardarDonacion = function (imprimirEtiquetas) {
                if (donacionScope.NroRegistro === "" || donacionScope.IdDestino === "-1") {
                    $scope.validaciones = true;
                    return;
                }

                var donacion = crearDonacion(donacionScope.NroRegistro, donacionScope.IdDonante, donacionScope.IdDestino, donacionScope.Material,
                    donacionScope.Cantidad, donacionScope.Peso, $("#calendarioFecha").datepicker("getDate"), donacionScope.IdEstadoDonacion, $scope.idCuestionario);
                if ($scope.cantidadEtiquetasExtras == null) {
                    $scope.cantidadEtiquetasExtras = 0;
                }
                donacionesRepositorio.guardar(donacion, imprimirEtiquetas, $scope.cantidadEtiquetasExtras)
                    .then(function (result) {
                        if (result.data) {
                            modalServicio.open("success", "La donación se ha guardado con éxito.");
                            setTimeout(function () { $window.location.href = "/Cuestionarios/Cuestionario?idCuestionario=" + idCuestionario + "&accion=editarLuegoDonacion"; }, 1500);
                        }
                        else {
                            modalServicio.open("danger", "Error al guardar la donación.");
                        }
                    });
            };

            $scope.cerrar = function (imprimirEtiquetas) {
                $uibModalInstance.close();
                $scope.guardarDonacion(imprimirEtiquetas);
            };

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
                        modo: modo
                    };
                }
            }
        });
    }

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

            $scope.actualizarSerologiaParaDonacionPorLote = function (serologias) {
                var cont = 0;
                for(var i = 0; i < serologias.length; i++) {
                    var serologia = serologias[i];
                    serologiaRepositorio.actualizarSerologiaParaDonacion(serologia.NroRegistro, serologia.IdExamenSerologico, serologia.IdResultadoSerologia)
                        .then(function (result) {
                            if (result.data) {
                                cont += 1;
                                if (cont === serologias.length) {
                                    obtenerSerologiasParaDonacion(serologia.NroRegistro); //Usamos el del último, es el mismo para todo el conjunto.
                                    modalServicio.open("success", "Serología actualizada con éxito.");
                                }
                            }
                            else {
                                modalServicio.open("danger", "Error al actualizar la serología.");
                            }
                        });
                }
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

            $scope.guardarSalir = function () {
                $scope.actualizarSerologiaParaDonacionPorLote($scope.serologias);
                $uibModalInstance.close();
            };

            $scope.todosNoReactivo = function () {
                $scope.serologias.forEach(function (serologia) {
                    serologia.IdResultadoSerologia = 2;
                    serologia.DescripcionResultado = resultadosSerologia.find(x => x.IdResultadoSerologia === serologia.IdResultadoSerologia).TextoResultado;
                });
            };

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
    };

    function obtenerResultadosSerologia() {
        serologiaRepositorio.obtenerResultadosSerologia()
            .then(function (resultado) {
                $scope.resultadosSerologia = resultado.data !== "" ? resultado.data.datos : [];
            });
    }

});