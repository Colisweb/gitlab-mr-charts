let getProjectDetails = (~projectId: string, ~token: string) =>
  Js.Promise.(
    Axios.get(
      "https://gitlab.com/api/v4/projects/"
      ++ projectId
      ++ "?private_token="
      ++ token
    )
    |> then_(response => resolve(response##data))
  );

let getMergeRequestDetails =
    (~projectId: string, ~token: string, ~mergeRequestId: string) =>
  Js.Promise.(
    Axios.get(
      "https://gitlab.com/api/v4/projects/"
      ++ projectId
      ++ "/merge_requests/"
      ++ mergeRequestId
      ++ "?private_token="
      ++ token
    )
    |> then_(response => resolve(response##data))
  );