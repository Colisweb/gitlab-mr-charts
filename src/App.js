// @flow

import React, { Component } from 'react'
import { Chart } from 'react-google-charts'
import { getMergeRequests } from './services/api'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { Loader } from './components/loader'
import 'react-datepicker/dist/react-datepicker-cssmodules.css'

type Config = 'merged' | 'opened' | 'closed' | 'locked'

const getColumnsConfig = (config: Config) => {
  const commonConfig = [
    { type: 'string', id: 'project' },
    { type: 'string', id: 'title' },
    { type: 'date', id: 'Start' },
    { type: 'date', id: 'End' }
  ]

  switch (config) {
    case 'merged':
      return [...commonConfig]
    case 'opened':
      return [...commonConfig]
    case 'closed':
      return [...commonConfig]
    case 'locked':
      return [...commonConfig]
    default:
      return commonConfig
  }
}

const getRowValue = ({ config, projects, item }) => {
  const commonValue = [projects[item.project_id].name, item.title, new Date(item.created_at)]

  switch (config) {
    case 'merged':
      return [...commonValue, new Date(item.merged_at)]
    case 'opened':
      return [...commonValue, new Date()]
    case 'closed':
      return [...commonValue, new Date(item.closed_at)]
    case 'locked':
      return [...commonValue, new Date(item.locked_at)]

    default:
      return commonValue
  }
}

const selectOptions = [
  {
    value: 'merged',
    label: 'merged'
  },
  {
    value: 'opened',
    label: 'opened'
  },
  {
    value: 'closed',
    label: 'closed'
  },
  {
    value: 'locked',
    label: 'locked'
  }
]

type MomentDate = Object

type SelectOption = {|
  value: Config,
  label: string
|}

type AppState = {|
  isLoading: boolean,
  selectedOptions: SelectOption,
  rows: Array<{}>,
  selectedDate: MomentDate,
  token: string,
  columns: Array<{}>
|}

class App extends Component<{}, AppState> {
  state = {
    isLoading: true,
    selectedOptions: selectOptions[0],
    selectedDate: moment('2018-08-01'),
    token: window.localStorage.getItem('_cwAccessToken') || '',
    rows: [],
    columns: getColumnsConfig(selectOptions[0].value)
  }

  componentDidMount () {
    this._fetch()
  }

  componentDidUpdate (_: {}, prevState: AppState) {
    const { selectedOptions, selectedDate } = this.state

    if (prevState.selectedOptions.value !== selectedOptions.value || !prevState.selectedDate.isSame(selectedDate)) {
      this._fetch()
    }
  }

  _fetch = () => {
    const { selectedOptions, selectedDate, token } = this.state

    if (token) {
      this.setState({ isLoading: true })

      getMergeRequests({
        state: selectedOptions.value,
        createdAfter: selectedDate.format('YYYY-MM-DD'),
        token
      }).then(({ projects, mergeRequests }) => {
        this.setState({
          rows: mergeRequests.map(item =>
            getRowValue({
              config: selectedOptions.value,
              projects,
              item
            })
          ),
          columns: getColumnsConfig(selectedOptions.value),
          isLoading: false
        })
      })
    }
  }

  _onSelectChange = (option: SelectOption) => {
    this.setState({
      selectedOptions: option
    })
  }

  _onDatePickerChange = (date: MomentDate) => {
    this.setState(prevState => ({
      ...prevState,
      selectedDate: date
    }))
  }

  _onInputChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const token = event.target.value
    window.localStorage.setItem('_cwAccessToken', token)

    this.setState(prevState => ({
      ...prevState,
      token
    }))
  }

  render () {
    const { isLoading, rows, columns, selectedOptions, token } = this.state

    return (
      <div className='app'>
        <div className='cw-Filters'>
          <div className='cw-Filters-item'>
            <label className='cw-Filters-itemLabel' htmlFor='status'>
              Status :
            </label>
            <Select
              id='status'
              defaultValue={selectedOptions}
              options={selectOptions}
              onChange={this._onSelectChange}
            />
          </div>
          <div className='cw-Filters-item cw-Filters-item--input cw-Filters-item--datepicker'>
            <label className='cw-Filters-itemLabel' htmlFor='date'>
              Created after :
            </label>
            <DatePicker
              id='date'
              selected={this.state.selectedDate}
              onChange={this._onDatePickerChange}
              dateFormat='YYYY-MM-DD'
            />
          </div>
          <div className='cw-Filters-item cw-Filters-item--input'>
            <label className='cw-Filters-itemLabel' htmlFor='token'>
              Access token :
            </label>
            <input id='token' type='text' value={token} onChange={this._onInputChange} />
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : token ? (
          <Chart chartType='Timeline' data={[columns, ...rows]} width='100%' height='100%' legendToggle />
        ) : (
          'A token is required'
        )}
      </div>
    )
  }
}

export default App
