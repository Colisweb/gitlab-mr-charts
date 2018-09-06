let url = "https://gitlab.com/api/v4/projects/";

type projectDetail = {. "id": string};

let getProjectDetails:
  (~projectId: string, ~token: string) => Js.Promise.t(projectDetail) =
  (~projectId, ~token) =>
    Js.Promise.(
      Axios.get(url ++ projectId ++ "?private_token=" ++ token)
      |> then_(response => resolve(response##data))
    );

let getMergeRequestDetails:
  (~projectId: string, ~token: string, ~mergeRequestId: string) =>
  Js.Promise.t(projectDetail) =
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