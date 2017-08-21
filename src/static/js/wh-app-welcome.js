(function () {

var culture = 'de';

angular
.module('home', ['ngRoute', 'weaselDirectives'])

.value('api', {
    emailform: '/api/email'
})


.value('language', {
        en: {
            label_close: 'Close',
            label_about: 'About',
            label_privacy: 'Privacy',
            label_mobile: 'Mobile Devices',
            page_aboutHofmeister: '/static/templates/partial/aboutHofmeister.en.html',
            page_aboutMe: '/static/templates/partial/aboutMe.en.html',
            page_aboutProject: '/static/templates/partial/about.en.html',
            page_mobile: '/static/templates/partial/mobile.en.html',
            page_privacy: '/static/templates/partial/datenschutz.en.html'
        },
        de: {
            label_close: 'Schließen',
            label_aboutHofmeister: 'Über den Entwickler',
            label_aboutProject: 'Über das Project',
            label_aboutMe: 'Über Annika Berger',
            label_privacy: 'Datenschutz',
            label_mobile: 'Mobile Geräte',
            page_aboutHofmeister: '/static/templates/partial/aboutHofmeister.de.html',
            page_aboutMe: '/static/templates/partial/aboutMe.de.html',
            page_aboutProject: '/static/templates/partial/about.de.html',
            page_mobile: '/static/templates/partial/mobile.de.html',
            page_privacy: '/static/templates/partial/datenschutz.de.html'
        }
    }[culture]
)


.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/complete', {
        templateUrl: '/static/templates/partial/complete.' + culture +'.html',
        controller: 'finishController',
        controllerAs: 'finishCtrl'
    })
    .when('/finish', {
        templateUrl: '/static/templates/partial/finish.' + culture +'.html',
        controller: 'finishController',
        controllerAs: 'finishCtrl'
    })
    .otherwise({
        // I need this shite for language dependent routing
        templateUrl: '/static/templates/partial/welcome.' + culture +'.html',
        controller: 'homeController',
        controllerAs: 'homeCtrl'
    });
}]) // config


.service('messageBoxService', ['$http', 'language', function ($http, language) {
    function show(title, page, scope) {
        $http
        .get(page)
        .success(function (data) {
            scope.$emit('messageBox', [data, title, language.label_close]);
        });
    };
    return {
        show: show
    };
}])


.controller('footerController', ['$scope', 'language', 'messageBoxService', function ($scope, language, messageBox) {
    this.aboutProject = function () {
        messageBox.show(language.label_aboutProject, language.page_aboutProject, $scope);
    };
    this.aboutMe = function() {
        messageBox.show(language.label_aboutMe, language.page_aboutMe, $scope);
    };
    this.aboutHofmeister = function() {
        messageBox.show(language.label_aboutHofmeister, language.page_aboutHofmeister, $scope);
    };
    this.datenschutz = function () {
        messageBox.show(language.label_privacy, language.page_privacy, $scope);
    };
}])


.controller('finishController', ['$http', '$scope', 'api', 'language', function ($http, $scope, api, language) {
    $scope.formdata = {
        notify_results: true
    };
    $scope.email_submitted = false;
    this.submit = function (data) {
        data.submitted = new Date().toISOString();
        $http
        .post(api.emailform, {data: data})
        .success(function () {
            $scope.formdata = {};
            $scope.email_submitted = true;
        });
    };
}])


.controller('homeController', ['$scope', 'language', 'messageBoxService', function ($scope, language, messageBox) {
    this.mobile = function () {
        messageBox.show(language.label_mobile, language.page_mobile, $scope);
    };
}]);  // homeController


})(); // ns shield
