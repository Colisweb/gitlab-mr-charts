// @flow

import axios from 'axios'
import {difference, uniqBy} from 'lodash'
import {Object} from 'core-js'

const gitlabApi = axios.create({baseURL: 'https://gitlab.com/api/v4/'})

export const getProjectDetails = (projectId: string, token: string): Promise<{}> =>
  gitlabApi
    .get(`projects/${projectId}?private_token=${token}`)
    .then(res => res.data)

export const getMergeRequestDetails = (projectId: string, mergeRequestId: string, token: string): Promise<{}> =>
  gitlabApi
    .get(`projects/${projectId}/merge_requests/${mergeRequestId}?private_token=${token}`)
    .then(res => res.data)

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
  gitlabApi
    .get(
      `groups/colisweb/merge_requests?${
        state === 'all' ? '' : `state=${state}`
        }&scope=all&created_after=${createdAfter}&private_token=${token}&per_page=10000`
    )
    .then(res => res.data)
    .then(data => {
      return Promise.all(data.map(d => getMergeRequestDetails(d.project_id, d.iid, token))).then(data => {
        const projects = uniqBy(data, d => d.project_id)
        const savedProjects = window.localStorage.getItem('_cwProjects')

        if (savedProjects) {
          const savedProjectsParsed = JSON.parse(savedProjects)
          const hasNewProjects = difference(
            projects.map(p => p.project_id),
            Object.keys(savedProjectsParsed).map(t => +t)
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
