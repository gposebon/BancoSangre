"use strict";
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
            recuperarFiltros();
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

    function recuperarFiltros() {
        if (localStorage.getItem("busqApellido") != null) $scope.busqApellido = localStorage.getItem("busqApellido");
        if (localStorage.getItem("busqNombre") != null) $scope.busqNombre = localStorage.getItem("busqNombre");
        if (localStorage.getItem("busqGrupo") != null) $scope.busqGrupo = localStorage.getItem("busqGrupo");
        if (localStorage.getItem("busqLocalidad") != null) $scope.busqLocalidad = localStorage.getItem("busqLocalidad");
    }

    //Guardar filtros - En _LoginPartial.cshtml removemos las cookies.
    $scope.$watch("busqApellido", function () {
        if ($scope.idDonante === null && $scope.busqApellido !== undefined) localStorage.setItem("busqApellido", $scope.busqApellido); // Sólo para grilla
    });

    $scope.$watch("busqNombre", function () {
        if ($scope.idDonante === null && $scope.busqNombre !== undefined) localStorage.setItem("busqNombre", $scope.busqNombre); // Sólo para grilla
    });

    $scope.$watch("busqGrupo", function () {
        if ($scope.idDonante === null && $scope.busqGrupo !== undefined) localStorage.setItem("busqGrupo", $scope.busqGrupo); // Sólo para grilla
    });

    $scope.$watch("busqLocalidad", function () {
        if ($scope.idDonante === null && $scope.busqLocalidad !== undefined) localStorage.setItem("busqLocalidad", $scope.busqLocalidad); // Sólo para grilla
    });

    function obtenerFechaSinFormato(fechaJson) {
        return fechaJson != undefined && fechaJson !== "" ? new Date(parseInt(fechaJson.replace("/Date(", "").replace(")", ""))) : "";
    }

    function obtenerFechaConFormato(fechaJson) {
        if (fechaJson == undefined || fechaJson == "") return "";

        var fecha = new Date(parseInt(fechaJson.replace("/Date(", "").replace(")", "")));
        var dia = fecha.getDate();
        var mes = fecha.getMonth();
        var anio = fecha.getFullYear();
        return dia + "/" + (mes + 1) + "/" + anio;
    }

    //Grilla

    function obtenerDonantes() {
        donantesRepositorio.obtenerDonantes()
            .then(function (result) {
                $scope.donantes = result.data.data;
                $scope.infoPagina.totalItems = result.data.cantidad;

                for (var i = 0; i < $scope.donantes.length; i++) {
                    $scope.donantes[i].FechaUltimaDonacion = obtenerFechaSinFormato($scope.donantes[i].FechaUltimaDonacion);
                }
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

    $scope.obtenerClaseBoton = function () {
        return "btn btn-primary glyphicon glyphicon-" + ($scope.donacion ? "tint" : "pencil");
    }

    $scope.ordenarGrilla = function (columna) {
        $scope.ordenInvertido = $scope.ordenarPorCampo === columna && !$scope.ordenInvertido;
        $scope.ordenarPorCampo = columna;
    }

    //Creación y edición

    function obtenerDonante() {
        donantesRepositorio.obtenerDonante($scope.idDonante)
            .then(function (result) {
                $scope.donante = result.data.data.Donante;

                if ($scope.donante.FechaNacimiento != null)
                    $scope.calcularEdad(obtenerFechaSinFormato($scope.donante.FechaNacimiento));

                $scope.donante.FechaNacimiento = obtenerFechaConFormato($scope.donante.FechaNacimiento);
                $scope.donante.DiferidoHasta = obtenerFechaConFormato($scope.donante.DiferidoHasta);
                $scope.donante.FechaUltimaDonacion = obtenerFechaConFormato($scope.donante.FechaUltimaDonacion);

                $scope.tiposDocumentos = result.data.data.TiposDocumentos;
                $scope.gruposFactores = result.data.data.GruposFactores;
                $scope.provincias = result.data.data.Provincias;
                $scope.localidades = result.data.data.Localidades;
                $scope.estadosDonantes = result.data.data.EstadosDonantes;
                cargarCalendarios();
            });
    }

    $scope.calcularEdad = function (fecha) {
        var fechaNac = fecha != null ? fecha : $("#calendarioFechaNacimiento").datepicker("getDate");

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
            LugarNacimiento: $scope.donante.LugarNacimiento,
            Telefono: $scope.donante.Telefono,
            FechaNacimiento: $("#calendarioFechaNacimiento").datepicker("getDate"),
            Fecha: $scope.donante.Fecha,
            Ocupacion: $scope.donante.Ocupacion,
            FechaUltimaDonacion: $scope.donante.FechaUltimaDonacion
        }
    }

    $scope.guardar = function (crearCuestionario) {
        if ($scope.donante.IdTipoDoc === -1 || $scope.donante.NroDoc === "" || $scope.donante.Apellido === "" || $scope.donante.Nombre === "" || $scope.donante.IdGrupoFactor === -1 ||
            $scope.donante.IdProvincia === -1 || $scope.donante.IdLocalidad === -2 || ($scope.donante.IdLocalidad === -1 && $scope.donante.OtraLocalidad === "") ||
            $scope.donante.IdEstadoDonante === -1) {

            $scope.validar = true;
            return;
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