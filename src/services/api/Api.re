let url = "https://gitlab.com/api/v4/projects/";

type projectDetail = {. "id": string};

type mergeRequestDetail = {. "project_id": string};

let getProjectDetails:
  (~projectId: string, ~token: string) => Js.Promise.t(projectDetail) =
  (~projectId, ~token) =>
    Js.Promise.(
      Axios.get(url ++ projectId ++ "?private_token=" ++ token)
      |> then_(response => resolve(response##data))
    );

let getMergeRequestDetails:
  (~projectId: string, ~token: string, ~mergeRequestId: string) =>
  Js.Promise.t(mergeRequestDetail) =
  (~projectId, ~token, ~mergeRequestId) =>
    Js.Promise.(
      Axios.get(
        url
        ++ projectId
        ++ "/merge_requests/"
        ++ mergeRequestId
        ++ "?private_token="
        ++ token,
      )
      |> then_(response => resolve(response##data))
    );

let fetchProjects:
  (~projectIds: array(string), ~token: string) =>
  Js.Promise.t(Js.Dict.t(projectDetail)) =
  (~projectIds, ~token) =>
    Js.Promise.all(
      Array.map(
        projectId => getProjectDetails(~projectId, ~token),
        projectIds,
      ),
    )
    |> Js.Promise.then_(projects =>
         Js.Dict.fromArray(
           Array.map(project => (project##id, project), projects),
         )
         |> Js.Promise.resolve
       );

let getMergeRequestStateQueryParam = (state: string) =>
  switch (Helpers.mergeRequestStateFromJs(state)) {
  | None => ""
  | Some(s) =>
    switch (s) {
    | `opened => "&state=opened"
    | `closed => "&state=closed"
    | `merged => "&state=merged"
    | `locked => "&state=locked"
    }
  };

let getMergeRequests:
  (~state: string, ~createdAfter: string, ~token: string) =>
  Js.Promise.t({
    .
    "projects": Js.Dict.t(projectDetail),
    "mergeRequests": array(mergeRequestDetail),
  }) =
  (~state, ~createdAfter, ~token) => {
    let url =
      "https://gitlab.com/api/v4/groups/colisweb/merge_requests?scope=all"
      ++ getMergeRequestStateQueryParam(state)
      ++ "&created_after="
      ++ createdAfter
      ++ "&private_token="
      ++ token;
    Axios.get(url)
    |> Js.Promise.then_(response =>
         Js.Promise.all(
           Array.map(
             project =>
               getMergeRequestDetails(
                 ~projectId=project##project_id,
                 ~token,
                 ~mergeRequestId=project##iid,
               ),
             response##data,
           ),
         )
         |> Js.Promise.then_(mergeRequests => {
              let projects =
                Lodash.uniqBy(
                  mergeRequests, (mergeRequest: mergeRequestDetail) =>
                  mergeRequest##project_id
                );
              let projectIds =
                Array.map(project => project##project_id, projects);
              fetchProjects(~projectIds, ~token)
              |> Js.Promise.then_(projects =>
                   Js.Promise.resolve({
                     "projects": projects,
                     "mergeRequests": mergeRequests,
                   })
                 );
            })
       );
  };