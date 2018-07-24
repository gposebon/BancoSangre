"use strict";

app.controller("cuestionarioController", function ($scope, cuestionarioRepositorio, modalServicio, $window) {
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
        $scope.idCuestionario = obtenerParametroPorNombre("idCuestionario");
        $scope.accion = obtenerParametroPorNombre("accion");
        switch ($scope.accion) {
			case "crear":
				$scope.editar = true;
				$scope.linkVolver = "/Donantes/Editar?idDonante=" + $scope.idDonante;
                obtenerCuestionarioEnBlanco();
				break;
			case "vistaPrevia":
				$scope.editar = false;
				$scope.linkVolver = "/Preguntas/Grilla";
				obtenerCuestionarioEnBlanco();
				break;
			case "ver":
				$scope.editar = false;
				$scope.linkVolver = "/Cuestionarios/CuestionariosExistentes?idDonante=" + $scope.idDonante + "&accion=listar";
                obtenerCuestionarioPorId($scope.idCuestionario);
                break;
            case "verDesdeDonaciones":
                $scope.editar = false;
                $scope.linkVolver = "/Donaciones/Grilla";
                obtenerCuestionarioPorId($scope.idCuestionario);
                break;
			case "listar":
				$scope.linkVolver = "/Donantes/Grilla";
				configPaginacion();
				obtenerCuestionariosDeDonante();
                break;
            case "editar":
                $scope.linkVolver = "/Donantes/Grilla";
                $scope.editar = true;
                obtenerCuestionarioPorId($scope.idCuestionario);
                break;
		}
	}

    function obtenerFechaConFormato(fechaJson) {
        if (fechaJson == undefined || fechaJson == "") return "";

        var fecha = new Date(parseInt(fechaJson.replace("/Date(", "").replace(")", "")));
        var dia = fecha.getDate();
        var mes = fecha.getMonth();
        var anio = fecha.getFullYear();
        return dia + "/" + (mes + 1) + "/" + anio;
    }

	function obtenerCuestionarioEnBlanco() {
		if ($scope.idDonante !== null) {
			cuestionarioRepositorio.obtenerCuestionarioParaDonante($scope.idDonante)
				.then(function (result) {
					$scope.datosDemograficos = result.data !== "" ? result.data.data.DatosDemograficos : [];
					$scope.preguntas = result.data !== "" ? result.data.data.Preguntas : [];
                    $scope.fecha = result.data !== "" ? result.data.data.Fecha : "";

                    $scope.fecha = obtenerFechaConFormato($scope.fecha);
                    cargarCalendario();
				});
		}
	}

	function obtenerCuestionarioPorId(idCuestionario) {
		if (idCuestionario !== null) {
			cuestionarioRepositorio.obtenerCuestionarioPorId(idCuestionario)
				.then(function (result) {
					$scope.datosDemograficos = result.data !== "" ? result.data.data.DatosDemograficos : [];
                    $scope.fecha = result.data !== "" ? result.data.data.Fecha : "";
                    $scope.registroDonacion = result.data !== "" ? result.data.data.RegistroDonacion : "";
					$scope.preguntas = result.data !== "" ? result.data.data.Preguntas : [];
					//Las respuestas (abiertas y encriptadas) se persisten encripatas en BD. VUelven como string, las pasamos a bool.
					var i;
					for (i = 0; i < $scope.preguntas.length; ++i) {
						if ($scope.preguntas[i].RespuestaCerrada !== null) {
							var esVerdadero = ($scope.preguntas[i].RespuestaCerrada === "True");
							$scope.preguntas[i].RespuestaCerrada = esVerdadero;
						}
                    }
				});
		}
	}

	function obtenerCuestionariosDeDonante() {
		if ($scope.idDonante !== null) {
			cuestionarioRepositorio.obtenerCuestionariosDeDonante($scope.idDonante)
				.then(function (result) {
					$scope.donante = result.data !== "" ? result.data.data.Donante : [];
					$scope.cuestionarios = result.data !== "" ? result.data.data.Cuestionarios : [];
					$scope.infoPagina.totalItems = result.data.cantidad;
				});
		}
	}

	function crearObjetoCuestionario() {
		return {
			IdDonante: $scope.idDonante,
			DatosDemograficos: $scope.datosDemograficos,
			Preguntas: $scope.preguntas,
			Fecha: $scope.fecha
		}
	}

	function configPaginacion() {
		$scope.infoPagina = {
			pagina: 1,
			itemsPorPagina: 9,
			reversa: false,
			totalItems: 0
		};
	}

	$scope.guardarCuestionario = function (accion) {
		var cuestionario = crearObjetoCuestionario();
		cuestionarioRepositorio.guardar(cuestionario)
			.then(function (resultado) {
                if (resultado.data.Respuesta) {
                    $scope.idCuestionario = resultado.data.IdCuestionario;
					$scope.editar = false;
					modalServicio.open("success", "El cuestionario se ha guardado con éxito.");
					if (accion === "imprimir")
						imprimirCuestionario();
					if (accion === "donacion")
                        $window.location.href = "/Donaciones/Ingresar?idDonante=" + $scope.idDonante + "&idCuestionario=" + $scope.idCuestionario;
				}
				else {
					modalServicio.open("danger", "Error al guardar el cuestionario.");
				}
			});
	};

	$scope.imprimirCuestionario = function () {
		imprimirCuestionario();
	}

	function imprimirCuestionario() {
		$("input").each(function () {
			if ($(this).prop("type") === "radio") {
				$(this).attr("checked", $(this).filter(':checked').val());
            }
            if ($(this).prop("type") === "text" && $(this).val() !== null) {
                $(this).attr("value", $(this).val());
            }
        });

		$("textarea").each(function () {
			if ($(this).val() !== null) {
                $(this).html($(this).val());
			}
        });

		var html = "";
		$("link").each(function () {
			if ($(this).attr("rel").indexOf("stylesheet") !== -1) {
				html += '<link rel="stylesheet" href="' + $(this).attr("href") + '" />';
			}
		});

		var contenidoDiv = $("#contenido").html();
        contenidoDiv = contenidoDiv.replace(/placeholder="Respuesta"/g, 'style="border:none; resize:none;"') // Quita el placeholder "Respuesta" y el borde de los textAreas
            .replace(new RegExp('<input type="text"', 'g'), '<input type="text" style="border:none; resize:none; padding-left: 0;"'); // Quita el borde a los textBoxs

		html += '<body onload="window.focus(); window.print()"> ' + contenidoDiv + "</body>";
		var w = window.open("", "print");
		if (w) {
			w.document.write(html);
			w.document.close();
		}
	}

	$scope.obtenerClaseContenedor = function (pregunta) {
        var claseContenedor = "contenedorPreguntaRespuesta" + ((pregunta.LineaCompleta || pregunta.LineaHorizontal) ? "-LineaEntera" : "");
		if (pregunta.NuevaLinea)
			claseContenedor += " nuevaLinea";
		return claseContenedor;
	}

	$scope.obtenerClasePregunta = function (pregunta) {
        var clasePregunta = "preguntaRespuesta" + ((pregunta.EsTitulo || pregunta.LineaHorizontal) ? "-Titulo" : "");
		return clasePregunta;
    }

    function cargarCalendario() {
        $.datepicker.setDefaults($.datepicker.regional['es']);

        if ($('#calendarioFechaCuestionario').length) {
            $("#calendarioFechaCuestionario").datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: "dd/mm/yy",
                yearRange: "-10:c"
            }).mask("99/99/9999");
        } else {
            setTimeout(function () {
                cargarCalendario();
            }, 200);
        }        
    }

});