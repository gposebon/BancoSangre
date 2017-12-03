
var app = angular.module('bancoSangreApp', ['ui.bootstrap']);

app.config(['$qProvider', function ($qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
}]);