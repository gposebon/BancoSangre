
$(document).ready(function () {

	$("#checkMostrar").prop("indeterminate", true).data("checked", 0).on("click",
		function () {
			var el = $(this);

			switch (el.data("checked")) {
				case 0:
					el.data("checked", 1);
					el.prop("indeterminate", false);
					el.prop("checked", true);
					break;

				case 1:
					el.data("checked", 2);
					el.prop("indeterminate", false);
					el.prop("checked", false);
					break;

				default:
					el.data("checked", 0);
					el.prop("indeterminate", true);
					el.prop("checked", false);
			}

		});

});