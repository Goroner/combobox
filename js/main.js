(function(ng){
	var module = ng.module('MainApp', ['combobox']);

	module.controller('MainCtrl', ['$scope', function($scope){
		$scope.selectedOption = 1;
		
		$scope.options = [
			{id: 0, text: 'Option 1'}, 
			{id: 1, text: 'Option 2'}, 
			{id: 2, text: 'Option 3'}
		];
	}]);
}(angular));