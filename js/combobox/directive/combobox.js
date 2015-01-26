(function(ng){
	var module = ng.module('combobox', ['ngSanitize']);

	function Combobox(config) {
        this.preferences = {
            marker: function (text) {
                return '<b>' + text + '</b>';
            }
        };

        this.options = config && config.options ? config.options : [];
    }

    Combobox.CONSTANTS = {
        KEYS: {
            UP: 38,
            DOWN: 40,
            ENTER: 13
        }
    };

    Combobox.prototype = {
        addOption: function(option){
            this.options.push(option);
        },
        addOptions: function(options){
            this.options = options;
        },
        getOption: function(id){
            var i, option;

            for(i = 0; i < this.options.length; i++){
                option = this.options[i];

                if(option.id === id){
                    return option;
                }
            }
        },
        getOptions: function(){
            return this.options;
        },
        selectOption: function(id){
            var option = this.getOption(id);

            if(option){
                if(this.selectedOption){
                    this.selectedOption.selected = false;
                }

                option.selected = true;
                this.selectedOption = option;
                return option;
            }

            return false;
        },
        filter: function(pattern){
            var i, option, optionText, result = [], regExp = new RegExp(pattern, 'i');

            for (i = 0; i < this.options.length; i++) {
                option = this.options[i];
                optionText = option.text;

                if (regExp.test(optionText)) {
                    result.push({
                        id: option.id,
                        text: optionText.replace(pattern, this.preferences.marker(pattern))
                    });
                }
            }

            return result;
        },
        clear: function(){
            this.options = [];
            this.selectedOption = null;
        }
    };

    module.directive('combobox', ['$filter', function($filter) {
        return {
            require: 'ngModel',
            restrict: 'C',
            replace: true,
            templateUrl: '/templates/default.html',
            scope: {
                ngModel: '=',
                options: '=',
                ngChange: '&',
                placeholder: '@'
            },
            link: function ($scope, el, attr, ngModelCtrl) {
                var currentIndex = 0, lastElement, selectedOption,
                combobox = new Combobox({
                    options: $scope.options
                }), $input = ng.element(el).find('input')[0];

                //this array is filtered and rendered
                $scope.optionsView = combobox.getOptions();
                lastElement = $scope.optionsView.length - 1;

                /**** internal functions ****/
                function getIndex(id){
                    var i, option;

                    for(i = 0; i < $scope.optionsView.length; i++){
                        option = $scope.optionsView[i];

                        if(option.id === id){
                            return i;
                        }
                    }
                }

                function toggle(state){
                    $scope.opened = state !== undefined ? state : !$scope.opened;
                }
                /**** internal functions ****/                

                //executed when the input is changed
                $scope.handleChange = function(){
                    $scope.optionsView = combobox.filter($scope.query);
                    lastElement = $scope.optionsView.length - 1;
                    toggle(true);
                };

                //handles input/caret click
                $scope.handleClick = function(state){
                    toggle(state);
                };

                //handles input/option focus
                $scope.handleFocus = function(){
                    toggle(true);
                };

                //handles input blur
                $scope.handleBlur = function(){
                    toggle(false);
                };

                //handles option select (click)
                $scope.handleSelect = function(id){
                    selectedOption = combobox.selectOption(id);
                    
                    if(selectedOption){
                        $scope.query = selectedOption.text;
                    }

                    if($scope.ngChange){
                        $scope.ngChange();
                    }

                    ngModelCtrl.$validate();
                    toggle(false);
                    return selectedOption;
                };

                //handles keyboard click
                $scope.handleKeyboardClick = function(e){
                    var option;

                    if(e.keyCode === Combobox.CONSTANTS.KEYS.ENTER){
                        if($scope.optionsView && $scope.optionsView.length){
                            option = $scope.optionsView[currentIndex];

                            if(option){
                                return $scope.handleSelect(option.id);
                            }
                        }

                        return false;
                    }else if(e.keyCode === Combobox.CONSTANTS.KEYS.UP){
                        currentIndex -= 1;

                    }else if(e.keyCode === Combobox.CONSTANTS.KEYS.DOWN){
                        currentIndex += 1;
                    }

                    if(currentIndex < 0){
                        currentIndex = lastElement;
                    }else if(currentIndex > lastElement){
                        currentIndex = 0;
                    }
                };

                //force input focus
                $scope.focusInput = function(){
                    $input.focus();
                };

                //check if active class should be applied to options
                $scope.isActive = function(option){
                    if(currentIndex !== undefined && 
                        currentIndex !== null){
                        return currentIndex === getIndex(option.id);
                    }else{
                        return option.selected;
                    }
                };

                //check if preselected option exists
                if($scope.ngModel !== undefined && 
                    $scope.ngModel !== null){
                    $scope.handleSelect($scope.ngModel);
                }
        }
    };
}]);
}(angular));