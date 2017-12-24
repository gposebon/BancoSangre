
var app = angular.module('bancoSangreApp', ['ui.bootstrap', 'xeditable', 'angular-loading-bar', 'smart-table']);

app.run(function (editableOptions) {
	editableOptions.theme = 'bs3';
});

app.config(['$qProvider', function ($qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
}]);
