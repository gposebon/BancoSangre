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
            $scope.textoBotonEdicion = !$scope.donacion ? 'Editar' : 'Ingresar donación';
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
        if (localStorage.getItem("busqEstado") != null) $scope.busqEstado = parseInt(localStorage.getItem("busqEstado"));
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
    $scope.$watch("busqEstado", function () {
        if ($scope.idDonante === null && $scope.busqEstado !== undefined) localStorage.setItem("busqEstado", $scope.busqEstado); // Sólo para grilla
    });

    function obtenerFechaSinFormato(fechaJson) {
        return fechaJson !== undefined && fechaJson !== "" ? new Date(parseInt(fechaJson.replace("/Date(", "").replace(")", ""))) : "";
    }

    function obtenerFechaConFormato(fechaJson) {
        if (fechaJson === undefined || fechaJson === "") return "";

        var fecha = new Date(parseInt(fechaJson.replace("/Date(", "").replace(")", "")));
        var dia = fecha.getDate();
        var mes = fecha.getMonth();
        var anio = fecha.getFullYear();
        return dia + "/" + (mes + 1) + "/" + anio;
    }

    //Grilla

    function obtenerDonantes() {
        if ($scope.busqEstado == null) {
            $scope.busqEstado = -1;
        }
        donantesRepositorio.obtenerDonantes()
            .then(function (result) {
                $scope.donantes = result.data.Donantes;
                $scope.infoPagina.totalItems = result.data.Cantidad;
                $scope.estadosDonantes = result.data.EstadosDonantes;
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

    $scope.verEstado = function (idEstadoDonante, descripcionEstado, diferidoHasta, idDonante) {
        if (idEstadoDonante === 2 || idEstadoDonante === 3) {
            donantesRepositorio.obtenerCausalesDeRechazo(idDonante).then(function (result) {
                if (result.data.Razones) {
                    modalServicio.open("info", descripcionEstado + ": " + result.data.Razones);
                } else {
                    modalServicio.open("info", descripcionEstado + ". No se han podido recuperar las razones.");
                }
            });
        } else {
            var textoSecundario = "";
            if (idEstadoDonante === 3 && diferidoHasta != null)
                textoSecundario = " hasta " + new Date(diferidoHasta.match(/\d+/)[0] * 1).toLocaleDateString() + ".";
            modalServicio.open("info", descripcionEstado + textoSecundario);
        }
    };

    $scope.obtenerClaseBoton = function () {
        return "btn btn-primary glyphicon glyphicon-" + ($scope.donacion ? "tint" : "pencil");
    };

    $scope.ordenarGrilla = function (columna) {
        $scope.ordenInvertido = $scope.ordenarPorCampo === columna && !$scope.ordenInvertido;
        $scope.ordenarPorCampo = columna;
    };

    $scope.filtroEstado = function (donante) {
        return ($scope.busqApellido == null || donante.Apellido.toLowerCase().includes($scope.busqApellido.toLowerCase()))
            && ($scope.busqNombre == null || donante.Nombre.toLowerCase().includes($scope.busqNombre.toLowerCase()))
            && ($scope.busqGrupo == null || donante.DescripcionGrupoFactor.toLowerCase().includes($scope.busqGrupo.toLowerCase()))
            && ($scope.busqLocalidad == null || donante.NombreLocalidad.toLowerCase().includes($scope.busqLocalidad.toLowerCase()))
            && ($scope.busqEstado === -1 || donante.IdEstadoDonante === $scope.busqEstado);
    };

    $scope.imprimirListado = function () {
        var html = "";
        $("link").each(function () {
            if ($(this).attr("rel").indexOf("stylesheet") !== -1) {
                html += '<link rel="stylesheet" href="' + $(this).attr("href") + '" />';
            }
        });

        var contenidoDiv = $("#listadoDonantes").html();

        contenidoDiv = contenidoDiv.replace(/<th id="thAcciones" style="color: #5a5a5a;"/g, '<th id="thAcciones" style="color: #5a5a5a; visibility:hidden;"')
            .replace(/<td id="tdAcciones" style="white-space: nowrap"/g, '<td id="tdAcciones" style="white-space: nowrap; visibility:hidden;"');

        html += '<body onload="window.focus(); window.print()" style="font-size: 11px !important;"> ' + contenidoDiv + "</body>";
        var w = window.open("", "print");
        if (w) {
            w.document.write(html);
            w.document.close();
        }
    };

    //Creación y edición

    function obtenerDonante() {
        donantesRepositorio.obtenerDonante($scope.idDonante)
            .then(function (result) {
                $scope.donante = result.data.data.Donante;
                if ($scope.donante.FechaNacimiento != null)
                    $scope.calcularEdad(obtenerFechaSinFormato($scope.donante.FechaNacimiento));

                if ($scope.donante.FechaNacimiento != null)
                    $scope.donante.FechaNacimiento = obtenerFechaConFormato($scope.donante.FechaNacimiento);
                if ($scope.donante.DiferidoHasta != null)
                    $scope.donante.DiferidoHasta = obtenerFechaConFormato($scope.donante.DiferidoHasta);
                if ($scope.donante.FechaUltimaDonacion != null)
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
    };

    function cargarCalendarios() {
        $.datepicker.setDefaults($.datepicker.regional['es']);

        $("#calendarioFechaNacimiento").datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "dd/mm/yy",
            yearRange: "-90:c"
        }).mask("99/99/9999");

        $("#calendarioDiferidoHasta").datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "dd/mm/yy",
            yearRange: "c:c+10"
        }).mask("99/99/9999");
    }

    $scope.obtenerLocalidades = function () {
        $scope.donante.IdLocalidad = -2;

        donantesRepositorio.obtenerLocalidades($scope.donante.IdProvincia)
            .then(function (result) {
                $scope.localidades = result.data;
            });
    };

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
            FechaUltimaDonacion: $scope.donante.FechaUltimaDonacion,
            CausasIngresadasRechazoDiferido: $scope.donante.CausasIngresadasRechazoDiferido
        };
    }

    $scope.guardar = function (crearCuestionario) {
        if ($scope.donante.IdTipoDoc === -1 || $scope.donante.NroDoc === "" || $scope.donante.Apellido === "" || $scope.donante.Nombre === "" || $scope.donante.IdGrupoFactor === -1 ||
            $scope.donante.IdProvincia === -1 || $scope.donante.IdLocalidad === -2 || $scope.donante.IdLocalidad === -1 && $scope.donante.OtraLocalidad === "" ||
            $scope.donante.IdEstadoDonante === -1 || $scope.localidadExistente)
        {
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
                    modalServicio.open("danger", result.data.data);
                }
            });
    };

    $scope.$watch('donante.OtraLocalidad', function () {
        if ($scope.localidades !== undefined) {
            for (var i = 0; i < $scope.localidades.length; i++) {
                if ($scope.donante.OtraLocalidad === $scope.localidades[i].NombreLocalidad) {
                    $scope.localidadExistente = true;
                    return;
                }
            }
        }
        $scope.localidadExistente = false;
    });

});