"use strict";
app.factory("modalServicio", function ($uibModal) {

	function crearObjetoModal(mode, text) {
		return {
			text: text,
			mode: mode
		};
	}

	return {
		open: function (mode, text) {
			$uibModal.open({
				templateUrl: "/app/modal/modalContenido.html",
				controller: InstanciaModalCtrl,
				backdrop: true,
				keyboard: true,
				backdropClick: true,
				size: "lg",
				resolve: {
					data: function () {
						return crearObjetoModal(mode, text);
					}
				}
			});
		}
	};
});