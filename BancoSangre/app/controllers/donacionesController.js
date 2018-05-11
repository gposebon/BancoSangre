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
                $scope.estadosDonacion = result.data.EstadosDonacion;
            });
    }

    function obtenerDonacionEnBlanco() {
        donacionesRepositorio.obtenerDonacionEnBlanco($scope.idDonante)
            .then(function (result) {
                $scope.donacion = result.data.Donacion;
                $scope.destinos = result.data.Destinos;
                $scope.estadosDonacion = result.data.EstadosDonacion;
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

    function crearDonacion(nroRegistro, idDonante, idDestino, material, cantidad, peso, fecha, idEstadoDonacion) {
        return {
            NroRegistro: nroRegistro,
            IdDonante: idDonante,
            IdDestino: idDestino,
            Material: material,
            Cantidad: cantidad,
            Peso: peso,
            Fecha: fecha,
            IdEstadoDonacion: idEstadoDonacion
        }
    }

    // Pantalla ingresar
    $scope.guardar = function () {
        if ($scope.donacion.NroRegistro === "" || $scope.donacion.IdDestino === "-1") {
            $scope.validaciones = true;
            return;
        }

        var donacion = crearDonacion($scope.donacion.NroRegistro, $scope.donacion.IdDonante, $scope.donacion.IdDestino, $scope.donacion.Material,
            $scope.donacion.Cantidad, $scope.donacion.Peso, $("#calendarioFecha").datepicker("getDate"), $scope.donacion.IdEstadoDonacion);
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

    $scope.obtenerClaseVerIngresarSerologia = function(donacion) {
        var claseBase = "btn btn-primary glyphicon glyphicon-";
        if (donacion.examenes == undefined)
            return claseBase + "list-alt";
        return claseBase + "eye-open";
    };

    $scope.obtenerTituloVerIngresarSerologia = function (donacion) {
        if (donacion.examenes == undefined)
            return "Ingresar serología";
        return "Ver serología";
    };

});