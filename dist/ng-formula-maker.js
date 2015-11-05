/*
 ngFormulaMaker v0.0.1
 (c) 2015 Gildson
*/
angular.module('ng-formula-maker', [])
  .directive('ngFormulaMaker', ['$document', function($document){
    return {
      restrict: 'A',
      replace: true,
      scope: {
        emFormula: '=emFormula',
        emValue:      '=emValue',
        emSearch:     '&emSearch'
      },
      template: '<div class="formula-maker">' +
                '  <ul>' +
                '    <li class="formula-area">' +
                '      <ul>' +
                '        <li ng-repeat="item in formula track by $index" ng-class="{\'formula-maker-selected\': item.selected}" ng-click="item_select(item)">{{ item.description }}</li>' +
                '      </ul>' +
                '    </li>' +
                '    <li class="search-area">' +
                '      <ul>' +
                '        <li>' +
                '          <input type="text" placeholder="..." ng-model="search_text" ng-click="results_toggle()" ng-disabled="searching">' +
                '          <ul class="search-results" ng-show="results_showing">' +
                '            <li ng-repeat="result in results track by $index" ng-click="result_select(result)">{{result.description}}</li>' +
                '          </ul>' +
                '        </li>' +
                '        <li ng-click="search()" ng-class="{\'search-disabled\': searching}">Search</li>' +
                '        <li ng-click="item_add()">add</li>' +
                '        <li ng-click="item_delete()">del</li>' +
                '        <li ng-click="formula_add({\'description\': \'+\', \'value\': \'+\'})">+</li>' +
                '        <li ng-click="formula_add({\'description\': \'-\', \'value\': \'-\'})">-</li>' +
                '        <li ng-click="formula_add({\'description\': \'x\', \'value\': \'*\'})">x</li>' +
                '        <li ng-click="formula_add({\'description\': \'/\', \'value\': \'/\'})">/</li>' +
                '        <li ng-click="formula_add({\'description\': \'(\', \'value\': \'(\'})">(</li>' +
                '        <li ng-click="formula_add({\'description\': \')\', \'value\': \')\'})">)</li>' +
                '      </ul>' +
                '    </li>' +
                '  </ul>' +
                '</div>',
      link: function(scope, element, attrs){
        scope.formula = scope.emFormula ? angular.copy(scope.emFormula) : [];
        scope.results = [];
        scope.results_showing = false;
        scope.result_selected = {};
        scope.search_text = "";
        scope.searching = false;

        scope.search = function(){
          if(!scope.searching && scope.emSearch){
            scope.results_showing = false;
            scope.searching = true;
            scope.emSearch()(scope.search_text)
              .then(
                function(response){
                  scope.results = response.data.data;
                },
                function(response){
                  scope.results = [];
                })
              .finally(function(){
                  scope.results_toggle();
                  scope.searching = false;
              });
          }
        }

        scope.formula_add = function(item){
          if(item['description'] != undefined && item['value'] != undefined){
            scope.formula.push(angular.copy(item));
          }
          scope.result_clear();
        }

        scope.formula_get = function(){
          var exp = '';
          for(var n = 0; n < scope.formula.length; n++){
            exp += scope.formula[n].value + " ";
          }
          return exp.replace(/^\s+|\s+$/g,'');
        }

        scope.result_select = function(result){
          scope.result_selected = result;
          scope.search_text = result.description;
          scope.results_showing = false;
        }

        scope.result_clear = function(){
            scope.result_selected = {};
            scope.search_text = "";
            scope.results_showing = false;
        }

        scope.results_toggle = function(){
          if(scope.results.length > 0){
            scope.results_showing = !scope.results_showing;
          }
        }

        scope.item_select = function(item){
          item.selected = !item.selected;
          scope.result_clear();
        }

        scope.item_add = function(){
          if(scope.result_selected != {}){
            scope.formula_add(scope.result_selected);
          }
          scope.result_clear();
        }

        scope.item_delete = function(){
          for(var n = scope.formula.length -1; n >= 0; n--){
            if(scope.formula[n].selected){
              scope.formula.splice(n, 1);
            }
          }
          scope.result_clear();
        }

        angular.element(element[0].querySelector('.search-area input')).on('keydown', function(e){
          if(e.keyCode == 13){
            scope.search();
            scope.$apply();
          }
        });

        angular.element(element[0].querySelector('.formula-area')).on('click', function(e){
          element[0].querySelector('.search-area ul li:nth-child(1) input').focus();
        });


        $document.on('keydown', function(e){
          if(e.keyCode == 27 && scope.results_showing){
            scope.results_showing = false;
            scope.$apply();
          }
        });

        scope.$watch('formula', function(newValue, oldValue){
          scope.emValue = scope.formula_get();
        }, true)
      }
    }
  }]);