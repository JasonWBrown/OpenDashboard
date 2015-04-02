(function(angular) {
'use strict';
    
angular
.module('od.cards.pulse', ['OpenDashboardRegistry', 'OpenDashboardAPI'])
 .config(function(registryProvider){
    registryProvider.register('pulse',{
        title: 'Pulse',
        description: 'This card demonstrates student activity over time.',
        imgUrl: '',
        cardType: 'pulse',
        styleClasses: 'od-card col-xs-12',
	    config: [
	    ]
    });
 })
 .controller('PulseController', function($scope, $log, $http, EventService) {
	 $scope.message = null;
	 $scope.config = {
		  "labels": false,
		  "title": "Activity",
		  "legend": {
		    "display": false,
		    "position": "right"
		  },
		  "innerRadius": 0,
		  "lineLegend": "traditional",
		  mouseover: function(d) {
			  console.log(d);
			  var id = 'STUDENT'+d.x;
			  console.log(id);
			  if ($scope.fullData) {
				  console.log('do something');
				  var o = _.find($scope.fullData, function(n) {
					  return n.ALTERNATIVE_ID == id;
					});
				 console.log(o);
				  $scope.message = id+" received final grade "+o.FINAL_GRADE;
				  $scope.grade = '';
				  
				  if (S(o.FINAL_GRADE).contains('A')) {
					  $scope.grade = 'A';
				  }
				  else if (S(o.FINAL_GRADE).contains('B')) {
					$scope.grade = 'B';
				  }
				  else {
					  $scope.grade = 'C';
				  }
				  
				  
			  }
			  
		  },
		  mouseout: function(d) {
			  $scope.message = null;
		  }
		  
		};
	 $http.get('/cards/pulse/data.json').success(function(data) {
		 
		 $scope.fullData = data;

		 var series = [];
		 var series2 = [];
		 var dataSet = [];
		 var dataSet2 = [];
		 
		 var groupByData = function(event) {
			//return D.split('student')[1];
			return S(event.ALTERNATIVE_ID).strip('STUDENT').s;
		};
		
		var gbdate = function (event) {
			return event.EVENT_DATE;
		};
		
		var mapdate = function(value,key) {
			//console.log(value)
			
			var g = _.groupBy(value,function(event){return event.ALTERNATIVE_ID;});
			
			return {
					x:key,
					y:g
			};
			
		};
		
		var grouped2 = EventService.groupByAndMap(data,gbdate,mapdate);
console.log(grouped2);	




		var mapFunction = function(value,key){
			// by default map to the number of statements for the value
			var numberOfStatements = 0;
			if (value && value != null) {
				numberOfStatements = value.length;
			}
			
			return {
				x:key,
				y: [numberOfStatements]
			};
		}

        var grouped = EventService.groupByAndMap(data,groupByData,mapFunction);
        angular.forEach(grouped, function(value,key){
        	var obj = {};
        	obj.x = value.x;
        	var yArray = [];
        	yArray.push(value.y[0])
        	obj.y = yArray;
        //console.log(obj);
        	dataSet.push(obj);
        });

        //console.log(dataSet);

		 angular.forEach(dataSet,function(value,key){
			 //series.push(value.x.split('student')[1]);
			 series.push(S(value.x).strip('STUDENT').s);
			 series2.push(value.x);
		 });

		 
		 angular.forEach(grouped2, function (value,key) {
			 var valy = value.y;
			 var obj = {};
			 obj.x = value.x;
			 var yArray = [];
			 
			 angular.forEach(dataSet, function(value,key) {
				 var s = 'STUDENT'+value.x;
				 //console.log(valy);
				 var e = valy[s];
				 //console.log(s);
				 //console.log(e);
				 if (e) {
					 yArray.push(e.length);
				 }
				 else {
					 yArray.push(0);
				 }
			 });
			 obj.y = yArray;
			 dataSet2.push(obj);
		 })

		
		 $scope.data = {
		        		series: series,
		        		data : dataSet   
		        	};


		_.reduce(dataSet2, function(result,n,key) {
			console.log('r');
			console.log(result);
			console.log('n');
			console.log(n);
			console.log('k');
			console.log(key);
		});

		 $scope.data2 = {
series: series2,
 		data : dataSet2 
		                 };
		 
     });	 
	 
     $http.get('/cards/pulse/data3.json').success(function(data){
		 $scope.fullData = data;

var series = [];
var series2 = [];
var dataSet = [];
var dataSet2 = [];

var groupByData = function(event) {
	//return D.split('student')[1];
	return S(event.ALTERNATIVE_ID).strip('STUDENT').s;
};

var gbdate = function (event) {
	return event.EVENT_DATE;
};

var mapdate = function(value,key) {
	//console.log(value)
	
	var g = _.groupBy(value,function(event){return event.ALTERNATIVE_ID;});
	
	return {
			x:key,
			y:g
	};
	
};

var grouped2 = EventService.groupByAndMap(data,gbdate,mapdate);
console.log(grouped2);	




var mapFunction = function(value,key){
	// by default map to the number of statements for the value
	var numberOfStatements = 0;
	if (value && value != null) {
		numberOfStatements = value.length;
	}
	
	return {
		x:key,
		y: [numberOfStatements]
	};
}

var grouped = EventService.groupByAndMap(data,groupByData,mapFunction);
angular.forEach(grouped, function(value,key){
	var obj = {};
	obj.x = value.x;
	var yArray = [];
	yArray.push(value.y[0])
	obj.y = yArray;
//console.log(obj);
	dataSet.push(obj);
});

//console.log(dataSet);

angular.forEach(dataSet,function(value,key){
	 //series.push(value.x.split('student')[1]);
	 series.push(S(value.x).strip('STUDENT').s);
	 series2.push(value.x);
});


angular.forEach(grouped2, function (value,key) {
	 var valy = value.y;
	 var obj = {};
	 obj.x = value.x;
	 var yArray = [];
	 
	 angular.forEach(dataSet, function(value,key) {
		 var s = 'STUDENT'+value.x;
		 //console.log(valy);
		 var e = valy[s];
		 //console.log(s);
		 //console.log(e);
		 if (e) {
			 yArray.push(e.length);
		 }
		 else {
			 yArray.push(0);
		 }
	 });
	 obj.y = yArray;
	 dataSet2.push(obj);
})


$scope.data = {
       		series: series,
       		data : dataSet   
       	};


_.reduce(dataSet2, function(result,n,key) {
	console.log('r');
	console.log(result);
	console.log('n');
	console.log(n);
	console.log('k');
	console.log(key);
});

$scope.data2 = {
series: series2,
data : dataSet2 
                };

     });
});
})(angular);
