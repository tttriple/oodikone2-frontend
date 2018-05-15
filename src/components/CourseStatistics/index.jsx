import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Form, Button, Header, Checkbox, Message } from 'semantic-ui-react'
import Datetime from 'react-datetime'
import Timeout from '../Timeout'
import CourseSearch from '../CourseSearch'
import CoursePassRateChart from '../CoursePassRateChart'
import { getCourseStatistics, removeCourseStatistics } from '../../redux/courseStatistics'
import { isValidYear, isInDateFormat, reformatDate, momentFromFormat } from '../../common'


import style from './courseStatistics.css'
import sharedStyles from '../../styles/shared'

const { shape, func, array } = PropTypes

const INITIAL_YEARS = {
  start: '2017',
  end: '2018'
}

class CourseStatistics extends Component {
  state = {
    selectedCourse: { name: 'No course selected', code: '' },
    ...INITIAL_YEARS,
    separate: false,
    validYear: true,
    error: ''
  }

  handleResultSelect = (e, { result }) => {
    this.setState({ selectedCourse: result }, () => {
      this.fetchCourseStatistics()
    })
  }

  addYear = change => () => {
    const year = this.state[change]
    const nextYear = momentFromFormat(year, 'YYYY').add(1, 'year')
    this.handleYearSelection(nextYear, change)
  }

  subtractYear = change => () => {
    const year = this.state[change]
    const previousYear = momentFromFormat(year, 'YYYY').subtract(1, 'year')
    this.handleYearSelection(previousYear, change)
  }

  fetchCourseStatistics = () => {
    const { code } = this.state.selectedCourse
    const { start, end, separate } = this.state
    const { selected } = this.props.courseStatistics
    const query = { code, start: Number(start), end: Number(end), separate: String(separate) }
    const aa = selected.find(olquery =>
      olquery.separate === query.separate &&
      olquery.end === query.end &&
      olquery.start === query.start &&
      olquery.code === query.code)
    if (!aa) {
      this.props.getCourseStatistics(query)
      this.setState({ error: '' })
    } else this.setState({ error: 'Course with selected parameters already in analysis' })
  }

  removeCourseStatistics = query => this.props.removeCourseStatistics(query)


  startBeforeEnd = (year, change) => {
    if (change === 'start') {
      return this.state.end > reformatDate(year, 'YYYY')
    }
    return this.state.start < reformatDate(year, 'YYYY')
  }

  handleYearSelection = (year, change) => {
    this.setState({ error: '' })
    const validYear = isInDateFormat(year, 'YYYY') && isValidYear(year) && this.startBeforeEnd(year, change)
    if (validYear) {
      this.setState({
        validYear,
        [change]: reformatDate(year, 'YYYY')
      })
    } else {
      this.setState({ validYear })
    }
  }

  handleStartYearSelection = (year) => {
    this.handleYearSelection(year, 'start')
  }

  handleEndYearSelection = (year) => {
    this.handleYearSelection(year, 'end')
  }

  handleSemesterSeparate = () => {
    this.setState({ error: '' })
    const bool = this.state.separate
    this.setState({ separate: !bool })
  }
  renderErrorMessage = () => {
    const { error } = this.state
    if (error) {
      return (<Message
        error
        color="red"
        header={error}
      />)
    }
    return error
  }

  renderEnrollmentDateSelector = () => {
    const { validYear, start, end } = this.state

    return (
      <Form>
        <Form.Group key="year" className={style.enrollmentSelectorGroup}>
          <Form.Field error={!validYear} className={style.yearSelect}>
            <label>Start year</label>
            <Datetime
              className={style.yearSelectInput}
              control={Datetime}
              dateFormat="YYYY"
              timeFormat={false}
              closeOnSelect
              value={start}
              isValidDate={isValidYear}
              onChange={this.handleStartYearSelection}
            />
          </Form.Field>
          <Form.Field className={style.yearControl}>
            <Button.Group basic vertical className={style.yearControlButtonGroup}>
              <Button
                icon="plus"
                className={style.yearControlButton}
                onClick={this.addYear('start')}
              />
              <Button
                icon="minus"
                className={style.yearControlButton}
                onClick={this.subtractYear('start')}
              />
            </Button.Group>
          </Form.Field>
          <Form.Field error={!validYear} className={style.yearSelect}>
            <label>End year</label>
            <Datetime
              className={style.yearSelectInput}
              control={Datetime}
              dateFormat="YYYY"
              timeFormat={false}
              closeOnSelect
              value={end}
              isValidDate={isValidYear}
              onChange={this.handleEndYearSelection}
            />
          </Form.Field>
          <Form.Field className={style.yearControl}>
            <Button.Group basic vertical className={style.yearControlButtonGroup}>
              <Button
                icon="plus"
                className={style.yearControlButton}
                onClick={this.addYear('end')}
              />
              <Button
                icon="minus"
                className={style.yearControlButton}
                onClick={this.subtractYear('end')}
              />
            </Button.Group>
          </Form.Field>
          <Form.Field>
            <Checkbox
              label="Separate Spring/Fall"
              onChange={this.handleSemesterSeparate}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    )
  }

  render() {
    const { data } = this.props.courseStatistics

    return (
      <div className={style.container}>
        <Header className={sharedStyles.segmentTitle} size="large">
          Course Statistics
        </Header>
        {this.renderEnrollmentDateSelector()}
        {this.renderErrorMessage()}
        <CourseSearch handleResultSelect={this.handleResultSelect} />

        {data.map(course => (<CoursePassRateChart
          removeCourseStatistics={removeCourseStatistics}
          key={course.code}
          stats={course}
        />
        ))
        }
      </div>
    )
  }
}

CourseStatistics.propTypes = {
  getCourseStatistics: func.isRequired,
  removeCourseStatistics: func.isRequired,
  courseStatistics: shape({
    data: array.isRequired,
    selected: array.isRequired
  }).isRequired
}

const mapStateToProps = ({ courses, courseStatistics }) => ({
  courses,
  courseStatistics
})

const mapDispatchToProps = dispatch => ({
  getCourseStatistics: query =>
    dispatch(getCourseStatistics(query)),
  removeCourseStatistics: query =>
    dispatch(removeCourseStatistics(query))
})


export default connect(mapStateToProps, mapDispatchToProps)(Timeout(CourseStatistics))
