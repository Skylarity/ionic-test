// Ionic ToDo App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'todo' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('todo', ['ionic'])

.factory('Projects', function() {
    return {
        all: function() {
            var projectString = window.localStorage.projects;
            if(projectString) {
                return angular.fromJson(projectString);
            }
            return [];
        },
        save: function(projects) {
            window.localStorage.projects = angular.toJson(projects);
        },
        newProject: function(projectTitle) {
            // Add a new project
            return {
                title: projectTitle,
                tasks: []
            };
        },
        getLastActiveIndex: function() {
            return parseInt(window.localStorage.lastActiveProject) || 0;
        },
        setLastActiveIndex: function(index) {
            window.localStorage.lastActiveProject = index;
        }
    };
})

.controller('TodoController', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {
    // A utility function for creating a new project with the given projectTitle
    var createProject = function(projectTitle) {
        var newProject = Projects.newProject(projectTitle);
        $scope.projects.push(newProject);
        Projects.save($scope.projects);
        $scope.selectProject(newProject, $scope.projects.length - 1);
    };

    // Load or initialize projects
    $scope.projects = Projects.all();

    // Grab the last active project, or the first project
    $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

    // Called to create a new project
    // $scope.newProject = function() {
    //     var projectTitle = prompt('Project name');
    //     if(projectTitle) {
    //         createProject(projectTitle);
    //     }
    // };

    // Called to select the given project
    $scope.selectProject = function(project, index) {
        if(index !== Projects.getLastActiveIndex()) {
            $scope.activeProject = project;
            Projects.setLastActiveIndex(index);
            $ionicSideMenuDelegate.toggleLeft(false);
        }
    };

    // Create and load the task modal
    $ionicModal.fromTemplateUrl('templates/new-task.html', function(modal) {
        $scope.taskModal = modal;
    }, {
        id: 0,
        scope: $scope,
        animation: 'slide-in-up'
    });

    // Create and load the task modal
    $ionicModal.fromTemplateUrl('templates/new-project.html', function(modal) {
        $scope.projectModal = modal;
    }, {
        id: 1,
        scope: $scope,
        animation: 'slide-in-up'
    });

    // Called on form submit
    $scope.createTask = function(task) {
        if(!$scope.activeProject || !task) {
            return;
        }
        $scope.activeProject.tasks.push({
            title: task.title
        });
        $scope.taskModal.hide();

        // Inefficient, but save all the projects
        Projects.save($scope.projects);

        task.title = "";
    };

    $scope.deleteTask = function(index) {
        $scope.activeProject.tasks.splice(index, 1);
        Projects.save($scope.projects);
    };

    $scope.deleteProject = function(index) {
        $scope.projects.splice(index, 1);
        Projects.save($scope.projects);
        if (index > 0) {
            $scope.activeProject = $scope.projects[index - 1];
        } else {
            $scope.activeProject = $scope.projects[0];
        }
        $ionicSideMenuDelegate.toggleLeft();
    };

    // Open the modal
    $scope.openModal = function(index) {
        if (index === 0) {
            $scope.taskModal.show();
        } else {
            $scope.projectModal.show();
        }
    };

    $scope.closeModal = function(index) {
        if (index === 0) {
            $scope.taskModal.hide();
        } else {
            $scope.projectModal.hide();
        }
    };

    $scope.createProject = function(project) {
        createProject(project.title);
        project.title = "";
        $scope.projectModal.hide();
    };

    $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.nukeEverything = function() {
        window.localStorage.projects = [];
    };

    // Try to create the first project, make sure to defer this by using $timeout so everything is initialized properly
    $timeout(function() {
        if($scope.projects.length === 0) {
            createProject("My First Project");
        }
    });
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
