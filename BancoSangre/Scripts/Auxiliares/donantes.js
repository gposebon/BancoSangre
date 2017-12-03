﻿
$(document).ready(function () {
	$("#DonanteActual_IdLocalidad").attr('disabled', $('#DonanteActual_IdProvincia option:selected').val() === "");
	$("#OtraLocalidad").hide();

	$("#DonanteActual_IdProvincia").on('change',
		function () {
			var idProvincia = $('#DonanteActual_IdProvincia option:selected').val();
			$("#DonanteActual_IdLocalidad").attr('disabled', idProvincia === "");
			$("#OtraLocalidad").hide();

			//Limpiamos el combo Localidad
			$('#DonanteActual_IdLocalidad')
					.find('option')
					.remove()
					.end();

			$.ajax({
				type: 'GET',
				url: 'TraerLocalidades',
				contentType: 'application/json; charset=utf-8',
				data: { idProvincia: idProvincia },
				dataType: 'json',
				success: function (result) {

					$('#DonanteActual_IdLocalidad').append($('<option>', {
						value: -1,
						text: 'Seleccione Localidad'
					}));

					for (var i = 0; i < result.length; i++) {
						$('#DonanteActual_IdLocalidad').append($('<option>', {
							value: result[i].IdLocalidad,
							text: result[i].NombreLocalidad
						}));
					}

					$("#DonanteActual_IdLocalidad").val("-1");
				}
			});
		});

	$("#DonanteActual_IdLocalidad").on('change',
		function () {
			var idLocalidad = $('#DonanteActual_IdLocalidad option:selected').val();

			if (idLocalidad === "0") {
				$("#OtraLocalidad").show();
			} else {
				$("#OtraLocalidad").hide();
			}
		});

	function calcularEdad(fechaNac) {
		var r = "";
		if (fechaNac !== "") {
			var anioHoy = new Date(Date.now()).getFullYear();
			var mesHoy = new Date(Date.now()).getMonth();
			var diaHoy = new Date(Date.now()).getDate();
			var anioNac = new Date(fechaNac).getFullYear();
			var mesNac = new Date(fechaNac).getMonth();
			var diaNac = new Date(fechaNac).getDate();
			var dif = anioHoy - anioNac;
			if (mesNac > mesHoy) dif--;
			else {
				if (mesNac === mesHoy) {
					if (diaNac > diaHoy) dif--;
				}
			}
			if (dif !== -1)
				r = dif;
		}
		$('#cajaEdad').val(r);
	}

	$(function () {
		$("#calendarioFechaNacimiento").datepicker({
			changeMonth: true,
			changeYear: true,
			onClose: function (fechaNac) {
				calcularEdad(fechaNac);
			}
		});
	});

	$(function () {
		$("#calendarioDiferidoHasta").datepicker({
			changeMonth: true,
			changeYear: true
		});
	});

	$("#DonanteActual_IdEstadoDonante").on('change',
		function () {
			var idEstado = $('#DonanteActual_IdEstadoDonante option:selected').val();

			if (idEstado === "3") {
				$("#DiferidoFecha").show();
			} else {
				$("#DiferidoFecha").hide();
			}
		});

	$("#DonanteActual_IdEstadoDonante").trigger("change");
	calcularEdad($("#calendarioFechaNacimiento").val());
});