// @flow

import axios from 'axios'
import { uniqBy, difference } from 'lodash'
import { getProjectDetails, getMergeRequestDetails } from './Api.bs'

const fetchProjects = (projects: Array<{}>, token: string): Promise<{}> =>
  Promise.all(projects.map(project => getProjectDetails(project.project_id, token))).then(projects => {
    const projectsHash = projects.reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {})

    window.localStorage.setItem('_cwProjects', JSON.stringify(projectsHash))

    return projectsHash
  })

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
      `https://gitlab.com/api/v4/groups/colisweb/merge_requests?${
        state === 'all' ? '' : `state=${state}`
      }&scope=all&created_after=${createdAfter}&private_token=${token}`
    )
    .then(res => res.data)
    .then(data => {
      return Promise.all(data.map(d => getMergeRequestDetails(d.project_id, token, d.iid))).then(data => {
        const projects = uniqBy(data, d => d.project_id)
        const savedProjects = window.localStorage.getItem('_cwProjects')

        if (savedProjects) {
          const savedProjectsParsed = JSON.parse(savedProjects)
          const hasNewProjects = difference(
            Object.keys(savedProjectsParsed).map(t => +t),
            projects.map(p => p.project_id)
          ).length

          if (hasNewProjects) {
            return fetchProjects(projects, token).then(projects => ({
              projects,
              mergeRequests: data
            }))
          } else {
            return {
              projects: savedProjectsParsed,
              mergeRequests: data
            }
          }
        } else {
          return fetchProjects(projects, token).then(projects => ({
            projects,
            mergeRequests: data
          }))
        }
      })
    })
