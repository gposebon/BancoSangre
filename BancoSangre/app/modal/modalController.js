
var InstanciaModalCtrl = function ($scope, $uibModalInstance, data) {
	$scope.data = data;
	$scope.close = function () {
		$uibModalInstance.close();
	};
};