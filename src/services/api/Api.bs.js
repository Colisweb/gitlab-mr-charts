// Generated by BUCKLESCRIPT VERSION 4.0.5, PLEASE EDIT WITH CARE
'use strict';

var Axios = require("axios");

function getProjectDetails(projectId, token) {
  return Axios.get("https://gitlab.com/api/v4/projects/" + (projectId + ("?private_token=" + token))).then((function (response) {
                return Promise.resolve(response.data);
              }));
}

function getMergeRequestDetails(projectId, token, mergeRequestId) {
  return Axios.get("https://gitlab.com/api/v4/projects/" + (projectId + ("/merge_requests/" + (mergeRequestId + ("?private_token=" + token))))).then((function (response) {
                return Promise.resolve(response.data);
              }));
}

exports.getProjectDetails = getProjectDetails;
exports.getMergeRequestDetails = getMergeRequestDetails;
/* axios Not a pure module */
