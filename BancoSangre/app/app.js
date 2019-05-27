var app = angular.module("bancoSangreApp", ["ui.bootstrap", "xeditable", "angular-loading-bar", "smart-table"]);

app.run(function (editableOptions) {
    editableOptions.theme = "bs3";
});

app.config(["$qProvider", function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

app.directive("soloLetras", function () {
	return {
		require: "ngModel",
		link: function (scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (inputValue) {
				var transformedInput = inputValue ? inputValue.replace(/[^A-Za-zÑñ ]/g, "") : null;

				if (transformedInput !== inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}

				return transformedInput;
			});
		}
	};
});

app.directive("soloNumeros", function () {
    return {
        require: "ngModel",
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                var transformedInput = inputValue ? inputValue.replace(/[^\d]/g, "") : null;

                if (transformedInput !== inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
});