(function () {

var culture = 'de';

angular
.module('home', ['ngRoute', 'weaselDirectives'])

.value('api', {
    emailform: '/api/email',
    sessions: '/api/sessions'
})


.value('language', {
        en: {
            label_close: 'Close',
            label_about: 'About',
            label_privacy: 'Privacy',
            label_mobile: 'Mobile Devices',
            label_results: 'Your Results',
            page_aboutHofmeister: '/static/templates/partial/aboutHofmeister.en.html',
            page_aboutMe: '/static/templates/partial/aboutMe.en.html',
            page_aboutProject: '/static/templates/partial/about.en.html',
            page_mobile: '/static/templates/partial/mobile.en.html',
            page_privacy: '/static/templates/partial/datenschutz.en.html',
            page_results: '/static/templates/partial/results.en.htlm'
        },
        de: {
            label_close: 'Schließen',
            label_aboutHofmeister: 'Über den Entwickler',
            label_aboutProject: 'Über das Project',
            label_aboutMe: 'Über Annika Berger',
            label_privacy: 'Datenschutz',
            label_mobile: 'Mobile Geräte',
            label_results: 'Ihr Ergebnis',
            page_aboutHofmeister: '/static/templates/partial/aboutHofmeister.de.html',
            page_aboutMe: '/static/templates/partial/aboutMe.de.html',
            page_aboutProject: '/static/templates/partial/about.de.html',
            page_mobile: '/static/templates/partial/mobile.de.html',
            page_privacy: '/static/templates/partial/datenschutz.de.html',
            page_results: 'static/templates/partial/results.de.html'
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
        notify_results: false
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

    $http
    .get(api.sessions)
    .success(function(sessiondata) {
        var userTime = getTimeForSession(sessiondata.data.current);
        $scope.mytime = msToMinAndS(userTime);
        var times = getTimesForAll(sessiondata.data.others);
        $scope.percentage = calculatePercentageWorse(userTime, times);
        times.push(userTime);
        $scope.average = msToMinAndS(getAverageTime(times));
        // delete cookie
        document.cookie = 'USER_SESSION_ID' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    })
    .error(function(message) {
        $scope.text = message;
        // delete cookie
        document.cookie = 'USER_SESSION_ID' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    });

    this.collectData = function () {

    }
}])

.controller('homeController', ['$scope', 'language', 'messageBoxService', function ($scope, language, messageBox) {
    this.mobile = function () {
        messageBox.show(language.label_mobile, language.page_mobile, $scope);
    };
}]);  // homeController

// calculated Duration needed for a Snippet with list of events
function getTimeForSnippet(events) {
    // count mistakes -> paused
    var mistakeCounter = 0;
    events.forEach(function(event) {
        if(event['code'] === 'Feedback Closed') {
            mistakeCounter++;
        }
    })

    var elapsedTime = calcTimeBetweenEvents(events[0], events[events.length-1]);

    var it = 1;
    while (mistakeCounter > 0) {
        if ((events[it])['code'] === 'Done' && (events[it+1])['code'] === 'Feedback Closed') {
            elapsedTime -= calcTimeBetweenEvents(events[it], events[it+1]);
            mistakeCounter--;
        }
        it++;
    }
    var timeObject = msToMinAndS(elapsedTime);
    return elapsedTime;

}

// transforms time in ms to time object with minutes and seconds
function msToMinAndS(time) {
    var timeInS = time / 1000;
    var min = Math.floor(timeInS/60);
    var sec = Math.round(timeInS % 60);
    return {minutes: min, seconds: sec};
}

// calculates Time Between two events in ms
function calcTimeBetweenEvents(startEvent, endEvent) {
    var start = new Date(startEvent['time']);
    var end = new Date(endEvent['time']);
    return end - start;
}

function getTimeForSession(session) {
    var timeInMs = 0;
    session.forEach(function(snippet) {
        timeInMs += getTimeForSnippet(snippet);
    })
    return timeInMs;
}

function getTimesForAll(sessions) {
	var times = []

    // NUR DAMIT NICHT KEINE ERGEBNISSE
    if (sessions.length == 0) {
        return [13*60*1000, 15*60*1000, 7*60*1000]
    }
	sessions.forEach(function(session) {
		times.push(getTimeForSession(session));
	})
	return times;
}

function getAverageTime(times) {
    var sum = 0;
    times.forEach(function(time) {
        sum += time;
    })
    return sum / times.length;
}

// gibt %-Zahl zurück, die beschreibt wie viele Sessions länger waren
function calculatePercentageWorse(time, otherTimes) {
	var counterTimeGreater = 0;
	for (var i = 0; i < otherTimes.length; i++) {
		if (otherTimes[i] > time) {
			counterTimeGreater++;
		}
	}
	return Math.round((counterTimeGreater / otherTimes.length) * 100);
}

})(); // ns shield
