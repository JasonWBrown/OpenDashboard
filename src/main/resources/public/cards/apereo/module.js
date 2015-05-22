(function(angular) {
'use strict';
    
angular
.module('od.cards.apereo', ['OpenDashboardRegistry', 'OpenDashboardAPI'])
 .config(function(registryProvider){
    registryProvider.register('apereo',{
        title: 'Apereo Workshop Card',
        description: 'Use this card for messing around at OpenApereo',
        imgUrl: 'https://wiki.jasig.org/download/attachments/15171585/global.logo?version=1&modificationDate=1421424698029&api=v2',
        cardType: 'apereo',
        styleClasses: 'od-card col-xs-12',
	    config: [
		    {field:'url',fieldName:'OpenLRS URL',fieldType:'url',required:false},
		    {field:'key',fieldName:'OpenLRS Key',fieldType:'text',required:false},
		    {field:'secret',fieldName:'OpenLRS Secret',fieldType:'text',required:false}
	    ]
    });
 })
 .controller('ApereoCardController', function($scope, $log, ContextService, RosterService, 
	 OutcomesService, DemographicsService) {
	
	$scope.course = ContextService.getCourse();
	$scope.lti = ContextService.getInbound_LTI_Launch();

});

})(angular);
