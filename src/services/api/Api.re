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

/* const fetchProjects = (projects: Array<{}>, token: string): Promise<{}> =>
   Promise.all(projects.map(project => getProjectDetails(project.project_id, token))).then(projects => {
     const projectsHash = projects.reduce((acc, item) => {
       acc[item.id] = item
       return acc
     }, {})

     window.localStorage.setItem('_cwProjects', JSON.stringify(projectsHash))

     return projectsHash
   }) */

let fetchProjects = (~projectIds: array(string), ~token: string) =>
  Js.Promise.all(
    Array.map(
      projectId => getProjectDetails(~projectId, ~token),
      projectIds,
    ),
  );