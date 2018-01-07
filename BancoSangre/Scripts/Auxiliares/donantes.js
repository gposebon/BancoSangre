
$(document).ready(function () {
	$("#DonanteActual_IdLocalidad").attr("disabled", $("#DonanteActual_IdProvincia option:selected").val() === "");
	$("#ContenedorOtraLocalidad").hide();
	var fechaNacFormatoGuardar;

	$("#DonanteActual_IdProvincia").on("change", function () {
		var idProvincia = $("#DonanteActual_IdProvincia option:selected").val();
		$("#DonanteActual_IdLocalidad").attr("disabled", idProvincia === "");
		$("#ContenedorOtraLocalidad").hide();
		$("#validacionOtraLocalidad").hide();

		//Limpiamos el combo Localidad
		$("#DonanteActual_IdLocalidad")
				.find("option")
				.remove()
				.end();

		$.ajax({
			type: "GET",
			url: "TraerLocalidades",
			contentType: "application/json; charset=utf-8",
			data: { idProvincia: idProvincia },
			dataType: "json",
			success: function (result) {

				$("#DonanteActual_IdLocalidad").append($("<option>", {
					text: "Seleccione Localidad"
				}));

				for (var i = 0; i < result.length; i++) {
					$("#DonanteActual_IdLocalidad").append($("<option>", {
						value: result[i].IdLocalidad,
						text: result[i].NombreLocalidad
					}));
				}

				$("#DonanteActual_IdLocalidad option").eq(0).prop("selected", true);
			}
		});
	});

	$("#DonanteActual_IdLocalidad").on("change", function () {
		$("#validacionOtraLocalidad").hide();
		var idLocalidad = $("#DonanteActual_IdLocalidad option:selected").val();

		if (idLocalidad === "-1") {
			$("#ContenedorOtraLocalidad").show();
		} else {
			$("#ContenedorOtraLocalidad").hide();
		}
	});

	$("#formularioDonante").submit(function (event) {
		var idLocalidad = $("#DonanteActual_IdLocalidad option:selected").val();

		if (idLocalidad === "-1" && $.trim($("#OtraLocalidad").val()) === "") {
			$("#validacionOtraLocalidad").show();
			$("#OtraLocalidad").val(""); //Limpia espacios en blanco
			return false;
		}

		return true;
	});

	function calcularEdad() {
		var fechaNac = $("#calendarioFechaNacimiento").val();
		var edad = "";
		if (fechaNac !== "") {
			var nac = new Date(fechaNac);

			var hoy = new Date(Date.now());
			var anioHoy = hoy.getFullYear();
			var mesHoy = hoy.getMonth();
			var diaHoy = hoy.getDate();
			var anioNac = nac.getFullYear();
			var mesNac = nac.getMonth();
			var diaNac = nac.getDate();
			var dif = anioHoy - anioNac;
			if (mesNac > mesHoy) dif--;
			else {
				if (mesNac === mesHoy) {
					if (diaNac > diaHoy) dif--;
				}
			}
			if (dif !== -1)
				edad = dif;

			$("#DonanteActual_FechaNacimiento").val(mesNac + 1 + "/" + diaNac + "/" + anioNac); //Actualiza el nuevo valor en el hidden que se usa para guardar
		}
		$("#cajaEdad").val(edad);
	}

	$(function () {
		$("#calendarioFechaNacimiento").datepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: "dd/mm/yy",
			yearRange: "-90:c",
			onClose: calcularEdad
		});
	});

	$(function () {
		$("#calendarioDiferidoHasta").datepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat: "dd/mm/yy",
			yearRange: "c:c+10"
		});
	});

	$("#DonanteActual_IdEstadoDonante").on("change",
		function () {
			var idEstado = $("#DonanteActual_IdEstadoDonante option:selected").val();

			if (idEstado === "3") {
				$("#DiferidoFecha").show();
			} else {
				$("#DiferidoFecha").hide();
			}
		});

	$("#DonanteActual_IdEstadoDonante").trigger("change"); //Si el estado es diferido muestra el calendario, de lo contrario no

	if ($("#DonanteActual_FechaNacimiento").val() !== "") {
		var fecNac = new Date($("#DonanteActual_FechaNacimiento").val()); //Sacamos la fecha del hidden
		$("#calendarioFechaNacimiento").val(fecNac.getDate() + "/" + (fecNac.getMonth() + 1) + "/" + fecNac.getFullYear()); //La mostramos en el campo
	}
	calcularEdad();
});