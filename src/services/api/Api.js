// @flow

import axios from 'axios'
import { uniqBy } from 'lodash'

export const getProjectDetails = (projectId: string, token: string): Promise<{}> =>
  axios.get(`https://gitlab.com/api/v4/projects/${projectId}?private_token=${token}`).then(res => res.data)

export const getMergeRequestDetails = (projectId: string, mergeRequestId: string, token: string): Promise<{}> =>
  axios
    .get(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mergeRequestId}?private_token=${token}`)
    .then(res => res.data)

type GetMergeRequestsBody = {|
  createdAfter: string,
  state: string,
  token: string
|}

type GetMergeRequestsPayload = {|
  projects: {
    [project_id: string]: Object
  },
  mergeRequests: Array<{}>
|}

export const getMergeRequests = ({
  createdAfter,
  state,
  token
}: GetMergeRequestsBody): Promise<GetMergeRequestsPayload> =>
  axios
    .get(
      `https://gitlab.com/api/v4/groups/colisweb/merge_requests?state=${state}&scope=all&created_after=${createdAfter}&private_token=${token}`
    )
    .then(res => res.data)
    .then(data => {
      return Promise.all(data.map(d => getMergeRequestDetails(d.project_id, d.iid, token))).then(data => {
        const projects = uniqBy(data, d => d.project_id)

        return Promise.all(projects.map(project => getProjectDetails(project.project_id, token))).then(projects => ({
          projects: projects.reduce((acc, item) => {
            acc[item.id] = item
            return acc
          }, {}),
          mergeRequests: data
        }))
      })
    })
