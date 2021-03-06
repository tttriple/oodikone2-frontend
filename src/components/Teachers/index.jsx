import React, { Component } from 'react'
import { shape, string, bool } from 'prop-types'
import { Header, Segment, Tab } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import sharedStyles from '../../styles/shared'
import TeacherSearchTab from '../TeacherSearchTab'
import TeacherPage from '../TeacherPage'
import TeacherStatistics from '../TeacherStatistics'
import TeacherLeaderBoard from '../TeacherLeaderBoard'
import { userRoles } from '../../common'

const pane = (title, Content, icon) => ({
  menuItem: { key: title, content: title, icon },
  render: () => (
    <Tab.Pane style={{ borderWidth: '0' }}>
      <Content />
    </Tab.Pane>
  )
})

const TeachersTabs = ({ admin }) => {
  const panes = admin ? [
    pane('Statistics', TeacherStatistics, 'table'),
    pane('Leaderboard', TeacherLeaderBoard, 'trophy'),
    pane('Search', TeacherSearchTab, 'user')
  ] : [pane('Statistics', TeacherStatistics, 'table')]

  return (
    <Tab
      menu={{ attached: false, borderless: true, tabular: true }}
      panes={panes}
    />
  )
}
class Teachers extends Component {
  state = {}

  async componentDidMount() {
    const roles = await userRoles()
    const admin = roles.includes('admin')

    this.setState({ admin })
  }

  render() {
    const { match } = this.props
    const { teacherid } = match.params
    return (
      <div className={sharedStyles.segmentContainer}>
        <Header className={sharedStyles.segmentTitle} size="large" content="Teacher statistics" />
        <Segment className={sharedStyles.contentSegment}>
          {teacherid
            ? <TeacherPage teacherid={teacherid} />
            : <TeachersTabs admin={this.state.admin} />
          }
        </Segment>
      </div>
    )
  }
}

Teachers.propTypes = {
  match: shape({
    params: shape({
      teacherid: string
    })
  })
}
TeachersTabs.propTypes = {
  admin: bool
}
TeachersTabs.defaultProps = {
  admin: undefined
}

Teachers.defaultProps = {
  match: {
    params: { teacherid: undefined }
  }
}

export default withRouter(Teachers)
