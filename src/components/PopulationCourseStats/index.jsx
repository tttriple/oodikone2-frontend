import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Form, Input, Popup, Button, Icon } from 'semantic-ui-react'
import { func, arrayOf, object, number, shape, string, oneOf, bool } from 'prop-types'
import { getTranslate } from 'react-localize-redux'
import _ from 'lodash'
import { withRouter } from 'react-router-dom'
import moment from 'moment'

import { setPopulationFilter, removePopulationFilterOfCourse } from '../../redux/populationFilters'
import { getMultipleCourseStatistics } from '../../redux/courseStatistics'
import { courseParticipation } from '../../populationFilters'

import styles from './populationCourseStats.css'

export const tableColumnNames = {
  STUDENTS: 'students',
  PASSED: 'passed',
  RETRY_PASSED: 'retryPassed',
  PERCENTAGE: 'percentage',
  FAILED: 'failed',
  FAILED_MANY: 'failedMany',
  ATTEMPTS: 'attempts',
  PER_STUDENT: 'perStudent',
  PASSED_OF_POPULATION: 'passedOfPopulation',
  TRIED_OF_POPULATION: 'triedOfPopulation'
}

export const sortOrderTypes = {
  ASC: 'ascending',
  DESC: 'descending'
}

const lodashSortOrderTypes = {
  ASC: 'asc',
  DESC: 'desc'
}

const SortableHeaderCell =
  ({ content, columnName, onClickFn, activeSortColumn, reversed, rowSpan }) => {
    const isTableSortedBy = activeSortColumn === columnName
    const direction = reversed ? sortOrderTypes.DESC : sortOrderTypes.ASC
    return (
      <Table.HeaderCell
        rowSpan={`${rowSpan}`}
        sorted={isTableSortedBy ? direction : null}
        onClick={() => onClickFn(columnName)}
        className={isTableSortedBy ? styles.activeSortHeader : ''}
        content={content}
      />
    )
  }

const tableColumnType = oneOf(Object.values(tableColumnNames))

SortableHeaderCell.propTypes = {
  content: string.isRequired,
  columnName: tableColumnType.isRequired,
  activeSortColumn: tableColumnType.isRequired,
  reversed: bool.isRequired,
  onClickFn: func.isRequired,
  rowSpan: number
}

SortableHeaderCell.defaultProps = {
  rowSpan: 1
}

const formatGradeDistribution = grades =>
  _.replace(JSON.stringify(_.sortBy(Object.entries(grades).map(([key, value]) => ({ [key]: value.count })), o => -Object.keys(o)), null, 1), /\[\n|{\n*|{\s|}|\s*}|]|"|,/g, '')

class PopulationCourseStats extends Component {
  static propTypes = {
    courses: shape({
      coursestatistics: arrayOf(object).isRequired,
      coursetypes: shape({}).isRequired,
      disciplines: shape({}).isRequired
    }).isRequired,
    translate: func.isRequired,
    setPopulationFilter: func.isRequired,
    populationSize: number.isRequired,
    selectedCourses: arrayOf(object).isRequired,
    removePopulationFilterOfCourse: func.isRequired,
    history: shape({}).isRequired,
    getMultipleCourseStatistics: func.isRequired,
    language: string.isRequired,
    query: shape({}).isRequired
  }

  state = {
    sortCriteria: tableColumnNames.STUDENTS,
    reversed: false,
    studentAmountLimit: parseInt(this.props.populationSize * 0.15, 10),
    codeFilter: '',
    showGradeDistribution: false
  }

  onCodeFilterChange = (e) => {
    const { target: { value } } = e
    this.setState({ codeFilter: value })
  }

  onSetCodeFilterKeyPress = (e) => {
    const { key } = e
    const enterKey = 'Enter'
    const isEnterKeyPress = key === enterKey
    if (isEnterKeyPress) {
      this.handleCourseStatisticsCriteriaChange()
    }
  }

  onStudentAmountLimitChange = (e) => {
    const { target: { value } } = e
    this.setState(
      { studentAmountLimit: value },
      () => this.handleCourseStatisticsCriteriaChange()
    )
  }

  onSortableColumnHeaderClick = (criteria) => {
    const { reversed, sortCriteria } = this.state
    const isActiveSortCriteria = sortCriteria === criteria
    const isReversed = isActiveSortCriteria ? !reversed : reversed

    this.setState({
      sortCriteria: criteria,
      reversed: isReversed
    }, () => this.handleCourseStatisticsCriteriaChange())
  }

  handleCourseStatisticsCriteriaChange = () => {
    const { studentAmountLimit, sortCriteria, codeFilter, reversed } = this.state
    const { courses: { coursestatistics } } = this.props

    const studentAmountFilter = ({ stats }) => {
      const { students } = stats
      return studentAmountLimit === 0 || students >= studentAmountLimit
    }
    const courseCodeFilter = ({ course }) => {
      const { code } = course
      return code.toLowerCase().includes(codeFilter.toLowerCase())
    }

    const filteredCourses = coursestatistics
      .filter(studentAmountFilter)
      .filter(c => !codeFilter || courseCodeFilter(c))

    const lodashSortOrder = reversed ? lodashSortOrderTypes.DESC : lodashSortOrderTypes.ASC

    const courseStatistics = _.orderBy(
      filteredCourses, (course => [course.stats[sortCriteria], course.code]
      ), [lodashSortOrder, lodashSortOrderTypes.DESC]
    )

    this.setState({ courseStatistics })
  }

  limitPopulationToCourse = course => () => {
    if (!this.active(course.course)) {
      const params = { course, field: 'all' }
      this.props.setPopulationFilter(courseParticipation(params))
    } else {
      this.props.removePopulationFilterOfCourse(course.course)
    }
  }

  active = course =>
    this.props.selectedCourses
      .find(c => course.name === c.name && course.code === c.code) !== undefined

  renderCodeFilterInputHeaderCell = () => {
    const { translate } = this.props
    const { codeFilter } = this.state
    return (
      <Table.HeaderCell>
        {translate('populationCourses.code')}
        <Input
          className={styles.courseCodeInput}
          transparent
          value={codeFilter}
          placeholder="(filter here)"
          onChange={this.onCodeFilterChange}
          onKeyPress={this.onSetCodeFilterKeyPress}
        />
      </Table.HeaderCell>)
  }

  renderGradeDistributionTable = (courseStatistics) => {
    const { translate, language } = this.props
    const { sortCriteria, reversed } = this.state
    return (
      <Table celled sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="2" content={translate('populationCourses.course')} />
            {this.renderCodeFilterInputHeaderCell()}
            <SortableHeaderCell
              content="Attempts"
              columnName={tableColumnNames.STUDENTS}
              onClickFn={this.onSortableColumnHeaderClick}
              activeSortColumn={sortCriteria}
              reversed={reversed}
            />
            <Table.HeaderCell content={0} />
            <Table.HeaderCell content={1} />
            <Table.HeaderCell content={2} />
            <Table.HeaderCell content={3} />
            <Table.HeaderCell content={5} />
            <Table.HeaderCell content="Other passed" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {courseStatistics.map(course => (
            <Popup
              key={course.course.code}
              trigger={
                <Table.Row active={false}>
                  <Table.Cell onClick={() => this.limitPopulationToCourse(course)}>
                    {course.course.name[language]}
                  </Table.Cell>
                  <Table.Cell
                    icon="level up alternate"
                    onClick={() => {
                      this.props.history.push('/coursestatistics/')
                      this.props.getMultipleCourseStatistics({
                        codes: [course.course.code],
                        start: Number(this.props.query.year),
                        end: Number(moment(moment(this.props.query.year, 'YYYY').add(this.props.query.months, 'months')).format('YYYY')),
                        separate: false,
                        language: this.props.language
                      })
                    }}
                    style={{ borderLeft: '0px !important' }}
                  />
                  <Table.Cell>{course.course.code}</Table.Cell>
                  <Table.Cell>
                    {course.grades ? _.sum(Object.values(course.grades).map(g => g.count)) || 0 : 0}
                  </Table.Cell>
                  <Table.Cell>
                    {course.grades ?
                      _.sum(Object.values(course.grades).filter(g =>
                        g.status.failingGrade).map(g => g.count))
                      || 0 : 0}
                  </Table.Cell>
                  <Table.Cell>
                    {course.grades[1] ? course.grades[1].count || 0 : 0}
                  </Table.Cell>
                  <Table.Cell>
                    {course.grades[2] ? course.grades[2].count || 0 : 0}
                  </Table.Cell>
                  <Table.Cell>
                    {course.grades[3] ? course.grades[3].count || 0 : 0}
                  </Table.Cell>
                  <Table.Cell>
                    {course.grades[4] ? course.grades[4].count || 0 : 0}
                  </Table.Cell>
                  <Table.Cell>
                    {course.grades[5] ? course.grades[5].count || 0 : 0}
                  </Table.Cell>
                  <Table.Cell>
                    {course.grades ?
                      _.sum(Object.values(_.omit(course.grades, [1, 2, 3, 4, 5])).filter(g =>
                        g.status.passingGrade || g.status.improvedGrade).map(g => g.count)) : 0}
                  </Table.Cell>
                </Table.Row>}
              flowing
              hoverable
              inverted
              position="top right"
              hideOnScroll
              content={course.grades ? <pre>{formatGradeDistribution(course.grades)}</pre> : 'Nothing to see here'}
            />
          ))}
        </Table.Body>
      </Table>
    )
  }
  renderBasicTable = (courseStatistics) => {
    const { translate, language } = this.props
    const { sortCriteria, reversed } = this.state


    const getSortableHeaderCell = (label, columnName, rowSpan = 1) =>
      (<SortableHeaderCell
        content={label}
        columnName={columnName}
        onClickFn={this.onSortableColumnHeaderClick}
        activeSortColumn={sortCriteria}
        reversed={reversed}
        rowSpan={rowSpan}
      />)

    const getTableHeader = () => (
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan="2" content={translate('populationCourses.course')} />
          {getSortableHeaderCell(translate('populationCourses.students'), tableColumnNames.STUDENTS, 2)}
          <Table.HeaderCell colSpan="3" content={translate('populationCourses.passed')} />
          <Table.HeaderCell colSpan="2" content={translate('populationCourses.failed')} />
          <Table.HeaderCell colSpan="2" content={translate('populationCourses.attempts')} />
          <Table.HeaderCell colSpan="2" content={translate('populationCourses.percentageOfPopulation')} />
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell content={translate('populationCourses.name')} />
          {this.renderCodeFilterInputHeaderCell()}
          {getSortableHeaderCell(translate('populationCourses.number'), tableColumnNames.PASSED)}
          {getSortableHeaderCell(translate('populationCourses.passedAfterRetry'), tableColumnNames.RETRY_PASSED)}
          {getSortableHeaderCell(translate('populationCourses.percentage'), tableColumnNames.PERCENTAGE)}
          {getSortableHeaderCell(translate('populationCourses.number'), tableColumnNames.FAILED)}
          {getSortableHeaderCell(translate('populationCourses.failedManyTimes'), tableColumnNames.FAILED_MANY)}
          {getSortableHeaderCell(translate('populationCourses.number'), tableColumnNames.ATTEMPTS)}
          {getSortableHeaderCell(translate('populationCourses.perStudent'), tableColumnNames.PER_STUDENT)}
          {getSortableHeaderCell(translate('populationCourses.passed'), tableColumnNames.PASSED_OF_POPULATION)}
          {getSortableHeaderCell(translate('populationCourses.attempted'), tableColumnNames.TRIED_OF_POPULATION)}
        </Table.Row>
      </Table.Header>
    )
    // this.active(course.course)
    return (
      <Table celled sortable>
        {getTableHeader()}
        <Table.Body>
          {courseStatistics.map(course => (
            <Table.Row key={course.course.code} active={false}>
              <Table.Cell onClick={() => this.limitPopulationToCourse(course)}>
                {course.course.name[language]}
              </Table.Cell>
              <Table.Cell
                icon="level up alternate"
                onClick={() => {
                  this.props.history.push('/coursestatistics/')
                  this.props.getMultipleCourseStatistics({
                    codes: [course.course.code],
                    start: Number(this.props.query.year),
                    end: Number(moment(moment(this.props.query.year, 'YYYY').add(this.props.query.months, 'months')).format('YYYY')),
                    separate: false,
                    language: this.props.language
                  })
                }}
                style={{
                  borderLeft: '0px !important',
                  display: 'none'
                }}
              />
              <Table.Cell>{course.course.code}</Table.Cell>
              <Table.Cell>
                {course.stats.passed + course.stats.failed}
              </Table.Cell>
              <Table.Cell>
                {course.stats.passed}
              </Table.Cell>
              <Table.Cell>
                {course.stats.retryPassed}
              </Table.Cell>
              <Table.Cell>{course.stats.percentage} %</Table.Cell>
              <Table.Cell>
                {course.stats.failed}
              </Table.Cell>
              <Table.Cell>
                {course.stats.failedMany}
              </Table.Cell>
              <Table.Cell>{course.stats.attempts}</Table.Cell>
              <Table.Cell>
                {course.stats.perStudent.toFixed(2)}
              </Table.Cell>
              <Table.Cell>{course.stats.passedOfPopulation} %</Table.Cell>
              <Table.Cell>{course.stats.triedOfPopulation} %</Table.Cell>
            </Table.Row>))}
        </Table.Body>
      </Table>
    )
  }

  render() {
    const { courses, translate } = this.props
    const { studentAmountLimit, showGradeDistribution, courseStatistics } = this.state

    if (courses.length === 0) {
      return null
    }

    const courseStats = courseStatistics || courses.coursestatistics

    return (
      <div>
        <Form>
          <Form.Field inline>
            <label>{translate('populationCourses.limit')}</label>
            <Input
              value={studentAmountLimit}
              onChange={this.onStudentAmountLimitChange}
            />
            <Button icon floated="right" onClick={() => this.setState({ showGradeDistribution: !showGradeDistribution })}>
              <Icon color="black" size="big" name="chart bar" />
            </Button>
          </Form.Field>
        </Form>
        {showGradeDistribution
          ? this.renderGradeDistributionTable(courseStats)
          : this.renderBasicTable(courseStats)
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const courseFilters = state.populationFilters.filters.filter(f => f.type === 'CourseParticipation')
  const selectedCourses = courseFilters.map(f => f.params.course.course)
  return {
    language: state.settings.language,
    translate: getTranslate(state.locale),
    query: state.populations.query,
    selectedCourses,
    populationSize: state.populations.data.students.length > 0 ?
      state.populations.data.students.length : 0
  }
}

export default connect(
  mapStateToProps,
  { setPopulationFilter, removePopulationFilterOfCourse, getMultipleCourseStatistics }
)(withRouter(PopulationCourseStats))
