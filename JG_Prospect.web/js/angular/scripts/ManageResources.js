﻿
app.controller('ManageResourceController', function ($scope, $compile, $http, $timeout, $filter) {
    getFiles($scope, $http, 1);
    removeBorders();
    callWebServiceMethod($http, "GetSources", { data: "" })
        .then(function (data) {
            var designations = getResponse(data);
            $scope.Designations = eval(designations);
            $scope.resource.designations = 0;
            $scope.resource.folders = "0";
            MakeDropdownChosen();
        });

    callWebServiceMethod($http, "GetLocation", { data: "" })
        .then(function (data) {
            var locations = getResponse(data);
            $scope.Locations = eval(locations);
            $scope.resource.locations = "0";
        });

    callWebServiceMethod($http, "GetResourceTypes", { data: "" })
        .then(function (data) {
            var resourceTypes = getResponse(data);
            $scope.ResourceTypes = eval(resourceTypes);
            $scope.resource.resourceTypes = "0";
        });

    $scope.getFolders = function () {
        getFolders();
    }

    $scope.GetFiles = function (locationId) {
        getFiles($scope, $http, locationId);
    }

    $scope.getFilesByDesignation = function (locationId, designationId) {
        getFilesByDesignation($scope, $http, locationId, designationId);
    }


    $scope.SaveMultipleDesignationFiles = function () {
        ShowAjaxLoader();
        var folderName = $(txtFolder).val();
        var DesgIds = $(ddlDesignation).val().join();
        var UploadedFiles = $(hdnBulkUploadFiles).val();
        var locationId = $(ddlLocation).val();

        callWebServiceMethod($http, "SaveFilesForMultipleDesignations", { Foldername: folderName, LocationId: locationId, designationIds: DesgIds, FileNames: UploadedFiles })
            .then(function (data) {
                var result = getResponse(data);
                if (result && result.Status == 200) {
                    getFiles($scope, $http, $('input[name=tabGroup1]:checked').attr('id-val'));
                    alert('File(s) has been saved successfully.');
                }
                else
                    alert('File has not been saved.');
                HideAjaxLoader();
            });

        // $event.preventDefault();
    }

    $scope.SaveData = function () {
        debugger;
        var result = validate($scope);
        if (result.isValidate) {
            ShowAjaxLoader();
            callWebServiceMethod($http, "SaveFiles", { name: result.name, folderId: result.folderId, designationId: result.designationId, locationId: result.locationId })
                .then(function (data) {
                    var result = getResponse(data);
                    if (result && result.Status == 200) {
                        resetForm($scope);
                        getFiles($scope, $http, $('input[name=tabGroup1]:checked').attr('id-val'));
                        alert('File(s) has been saved successfully.');
                    }
                    else
                        alert('File has not been saved.');
                    HideAjaxLoader();
                });
        }

    }

    $scope.ResetData = function ($event) {
        resetForm($scope);
        $event.preventDefault();
    }

    $scope.SaveFolders = function ($event) {
        var name = $scope.resource.folder;

        var designationId = parseInt($(ddlDesignation).val());

        if (designationId > 0 && name != '') {
            ShowAjaxLoader();
            callWebServiceMethod($http, "SaveFolders", { name: name, designationId: designationId })
                .then(function (data) {
                    var result = getResponse(data);
                    if (result && result.Status == 200 && result.ID == -1) {
                        alert('Folder already exists.');
                    }
                    else if (result && result.Status == 200) {
                        getFolders();
                        alert('Folder has been created successfully.');
                    }
                    else
                        alert('Folder has not been saved.');
                    HideAjaxLoader();
                });
        }
        else {
            alert('Designation and Folder name required.');
        }

        $event.preventDefault();
    }

    $scope.DeleteFolders = function ($event) {
        var folderId = parseInt($(".folders").val());
        if (folderId > 0) {
            if (confirm('Are you sure you want to delete?')) {
                callWebServiceMethod($http, "DeleteFolders", { folderId: folderId })
                    .then(function (data) {
                        var result = getResponse(data);
                        if (result && result.Status == 200) {
                            getFolders();
                            alert('Folder has been deleted successfully.');
                        }
                        else
                            alert('Folder has not been deleted.');
                    });
            }
        }
        else {
            alert('Folder is not selected.');
        }
        $event.preventDefault();
    }

    $scope.DeleteFiles = function (fileId) {

        if (fileId > 0 && confirm('Are you sure you want to delete?')) {
            ShowAjaxLoader();
            callWebServiceMethod($http, "DeleteFiles", { fileId: fileId })
                .then(function (data) {
                    var result = getResponse(data);
                    if (result && result.Status == 200) {
                        getFolders();
                        getFiles($scope, $http, $('input[name=tabGroup1]:checked').attr('id-val'));
                        alert('File has been deleted successfully.');
                    }
                    else
                        alert('File has not been deleted.');
                    HideAjaxLoader();
                });
        }
        else {
            alert('Folder is not selected.');
        }

    }

    //$scope.onDesignatonEnd = function () {
    //    DesignatonsUpdated();
    //}

    function getFolders() {

        var designationId = parseInt($(ddlDesignation).val());
        if (designationId) {
            ShowAjaxLoader();
            callWebServiceMethod($http, "GetFolders", { designationId: designationId })
                .then(function (data) {
                    var folders = getResponse(data);
                    $scope.Folders = eval(folders);
                    $scope.resource.folders = "0";
                    $scope.resource.folder = "";
                    HideAjaxLoader();
                });
        }
    }

    ManageResourceScope = $scope;
});



function callWebServiceMethod($http, methodName, filters) {
    return $http.post(url + methodName, filters);
}

function callWebServiceMethodGet($http, methodName, filters) {
    return $http.get(url + methodName, filters);
}

function getResponse(data) {
    try {
        if (data && data.data && data.data.d && data.data.d != '')
            return jsonResult = JSON.parse(data.data.d);
        else
            return [];
    }
    catch (e) {
        return [];
    };
};

function validate($scope) {
    var result = { isValidate: true, designationId: 0, locationId: 0, name: '', folderId: 0, resouceTypeId: 0 };
    parseInt($(ddlDesignation).val()) > 0 ? (result.designationId = parseInt($(ddlDesignation).val())) : (setValidationClass(result, 'designations'));
    parseInt($scope.resource.locations) > 0 ? (result.locationId = parseInt($scope.resource.locations)) : (setValidationClass(result, 'locations'));
    parseInt($scope.resource.folders) > 0 ? (result.folderId = parseInt($scope.resource.folders)) : (setValidationClass(result, 'folders'));
    //Resource type is automatically selected now.
    //parseInt($scope.resource.resourceTypes) > 0 ? (result.resouceTypeId = parseInt($scope.resource.resourceTypes)) : (setValidationClass(result, 'resourceTypes'));
    if (result.isValidate && $('.fileName').val() == '') {
        result.isValidate = false;
        alert('Please upload file');
    }
    else
        result.name = $('.fileName').val() ? $('.fileName').val() : '';
    return result;
}

function setValidationClass(result, className) {
    $("." + className).addClass('required');
    result.isValidate = false;
}

function resetForm($scope) {
    $scope.resource.designations = "0";
    $scope.resource.folders = "0";
    $scope.resource.resourceTypes = "0";
    $scope.resource.locations = "0";
    objworkfiledropzone.removeAllFiles();
    $('.fileName').val('');
}

function enabledisable(isEnable) {
    //$('.saveResource').prop('disabled', !isEnable);
    //$('.resetResource').prop('disabled', !isEnable);
}
function removeBorders() {
    $('select, input').change(function () {
        if ($(this).val() != '' || $(this).val() != '0' && $(this).hasClass('required')) {
            $(this).removeClass('required');
        }
    });
}

function getFiles($scope, $http, locationId) {
    callWebServiceMethod($http, "GetFiles", { locationId: locationId })
        .then(function (data) {
            var resourceTypes = getResponse(data);
            $scope.Categories = resourceTypes;
        });

}

function getFilesByDesignation($scope, $http, locationId, designationId) {
    callWebServiceMethod($http, "GetFilesByDesignationId", { locationId: locationId, DesignationId: designationId })
        .then(function (data) {
            var resourceTypes = getResponse(data);
            $scope.DesignationResources = resourceTypes;
            console.log(resourceTypes);
        });

}


//$scope.categories = [
//    {
//        title: 'Computers', // Designation
//        categories: [
//            {
//                title: 'Laptops', // Folders
//                categories: [
//                    {
//                        title: 'Ultrabooks' // Files
//                    },
//                    {
//                        title: 'Macbooks'
//                    }
//                ]
//            },

//            {
//                title: 'Desktops'
//            },

//            {
//                title: 'Tablets',
//                categories: [
//                    {
//                        title: 'Apple'
//                    },
//                    {
//                        title: 'Android'
//                    }
//                ]
//            }
//        ]
//    },

//    {
//        title: 'Printers'
//    }

//];