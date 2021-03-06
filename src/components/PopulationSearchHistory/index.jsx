import React, { Component } from 'react'
import { connect } from 'react-redux'
import { func, shape, object, bool } from 'prop-types'
import { getTranslate } from 'react-localize-redux'

import PopulationQueryCard from '../PopulationQueryCard'
import { removePopulation, updatePopulationStudents } from '../../redux/populations'
import { clearPopulationCourses } from '../../redux/populationCourses'
import { clearPopulationFilters } from '../../redux/populationFilters'

import styles from './populationSearchHistory.css'
import infotooltips from '../../common/InfoToolTips'
import InfoBox from '../InfoBox'

class PopulationSearchHistory extends Component {
  static propTypes = {
    translate: func.isRequired,
    removePopulation: func.isRequired,
    populations: shape({
      pending: bool,
      error: bool,
      data: shape({}),
      query: object
    }).isRequired,
    units: object, // eslint-disable-line
    updatePopulationStudents: func.isRequired
  }

  removePopulation = uuid => this.props.removePopulation(uuid)

  renderQueryCards = () => {
    const { populations, translate, units } = this.props
    const { QueryCard } = infotooltips.PopulationStatistics
    if (!populations.data.students) {
      return null
    }
    const studentNumberList = (populations.data.students.map(s => s.studentNumber))
    return populations.query ? (
      <React.Fragment>
        <PopulationQueryCard
          key={`population-${populations.query.uuid}`}
          translate={translate}
          population={populations.data}
          query={populations.query}
          queryId={0}
          unit={units.data.programmes[populations.query.studyRights[0]]} // Possibly deprecated
          units={
            ([
              ...Object.values(units.data.programmes),
              ...Object.values(units.data.degrees),
              ...Object.values(units.data.studyTracks)
            ]).filter(u => populations.query.studyRights.includes(u.code))
          }
          removeSampleFn={this.removePopulation}
          updateStudentsFn={() => this.props.updatePopulationStudents(studentNumberList)}
          updating={populations.updating}
        />
        <InfoBox content={QueryCard} />
      </React.Fragment>) : null
  }

  render() {
    return (
      <div className={styles.historyContainer} >
        {this.renderQueryCards()}
      </div>
    )
  }
}

const mapStateToProps = ({ populations, populationDegreesAndProgrammes, locale }) => ({
  populations,
  units: populationDegreesAndProgrammes,
  translate: getTranslate(locale)
})

const mapDispatchToProps = dispatch => ({
  removePopulation: (uuid) => {
    dispatch(removePopulation(uuid))
    dispatch(clearPopulationCourses())
    dispatch(clearPopulationFilters())
  },
  updatePopulationStudents: students => dispatch(updatePopulationStudents(students))

})

export default connect(mapStateToProps, mapDispatchToProps)(PopulationSearchHistory)
