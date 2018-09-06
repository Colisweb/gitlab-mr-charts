let url = "https://gitlab.com/api/v4/projects/";

type projectDetail = {. "id": string};

let getProjectDetails:
  (~projectId: string, ~token: string) => Js.Promise.t(array(projectDetail)) =
  (~projectId: string, ~token: string) =>
    Js.Promise.(
      Axios.get(url ++ projectId ++ "?private_token=" ++ token)
      |> then_(response => resolve(response##data))
    );

let getMergeRequestDetails =
    (~projectId: string, ~token: string, ~mergeRequestId: string) =>
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
  Js.Promise.t(array(array(projectDetail))) =
  (~projectIds: array(string), ~token: string) =>
    Js.Promise.all(
      Array.map(
        projectId => getProjectDetails(~projectId, ~token),
        projectIds,
      ),
    );