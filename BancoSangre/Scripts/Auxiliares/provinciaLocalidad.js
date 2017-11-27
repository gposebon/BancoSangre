
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

});