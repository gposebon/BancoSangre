
var InstanciaModalCtrl = function ($scope, $uibModalInstance, data) {
	$scope.data = data;
	$scope.cerrar = function () {
		$uibModalInstance.close();
	};
};