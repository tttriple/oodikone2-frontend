import React, { Component } from 'react'
import { Menu, Dropdown, Button } from 'semantic-ui-react'
import * as Sentry from '@sentry/browser'
import { NavLink, Link } from 'react-router-dom'
import { func, shape, string } from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { routes } from '../../constants'
import { userRoles, userRights } from '../../common'
import styles from './navigationBar.css'
import { logout, login, returnToSelf } from '../../apiConnection'

const { USER_ADMINER_URL, ADMINER_URL } = process.env

class NavigationBar extends Component {
  state = {
    navigationRoutes: routes
  }

  async componentDidMount() {
    await this.setNavigationRoutes()
  }

  async componentWillReceiveProps() {
    await this.setNavigationRoutes()
    this.render()
  }

  setNavigationRoutes = async () => {
    const navigationRoutes = { ...routes }
    const roles = await userRoles()
    Object.keys(navigationRoutes).forEach((key) => {
      if (navigationRoutes[key].reqRights && roles.every(r => navigationRoutes[key].reqRights.indexOf(r) === -1)) {
        delete navigationRoutes[key]
      }
    })
    const rights = await userRights()
    if (!roles.includes('admin')) {
      if (rights.length === 0) {
        delete navigationRoutes.courseStatistics
      }
    }
    this.setState({ navigationRoutes })
  }

  returnToSelf = () => async () => {
    await returnToSelf()
    this.props.history.push('/')
    window.location.reload()
  }

  renderUserMenu = (itemWidth) => {
    const { translate } = this.props
    if (process.env.NODE_ENV === 'development') {
      const testUsers = ['tktl']
      return (
        <Menu.Item
          as={Dropdown}
          style={{ backgroundColor: 'purple', color: 'white', width: `${itemWidth}%` }}
          text="Dev controls"
          tabIndex="-1"
        >
          <Dropdown.Menu>
            {ADMINER_URL && (
              <Dropdown.Item
                onClick={() => {
                  const win = window.open(ADMINER_URL, '_blank')
                  win.focus()
                }}
                text="Database"
                icon="database"
              />
            )}
            {USER_ADMINER_URL && (
              <Dropdown.Item
                onClick={() => {
                  const win = window.open(USER_ADMINER_URL, '_blank')
                  win.focus()
                }}
                text="User database"
                icon="database"
              />
            )}
            {testUsers.map(user => (
              <Dropdown.Item
                key={user}
                icon="user"
                text={`Use as: ${user}`}
                onClick={() => login()}
              />
            ))}
            <Dropdown.Item
              icon="log out"
              text={translate('navigationBar.logout')}
              onClick={logout}
            />
          </Dropdown.Menu>
        </Menu.Item>
      )
    }

    return (
      <Menu.Item link onClick={logout} icon="log out" tabIndex="-1" style={{ width: `${itemWidth}%` }}>
        {translate('navigationBar.logout')}
      </Menu.Item>
    )
  }

  render() {
    const { translate: t, asUser } = this.props
    const { navigationRoutes } = this.state
    const menuWidth = asUser ? Object.keys(navigationRoutes).length + 3 : Object.keys(navigationRoutes).length + 2
    const itemWidth = 100 / menuWidth
    return (
      <Menu stackable fluid widths={menuWidth} className={styles.navBar}>
        <Menu.Item
          style={{ width: `${itemWidth}%` }}
          as={Link}
          to={navigationRoutes.index.route}
          tabIndex="-1"
        >
          <span className={styles.logo}>
            <h2 className={styles.logoText}>oodikone</h2>
          </span>
        </Menu.Item>
        {
          Object.values(navigationRoutes).map((value) => {
            const viewableRoute = value.menuRoute
            if (!viewableRoute) {
              return null
            }
            return (
              <Menu.Item
                style={{ width: `${itemWidth}%` }}
                exact
                as={NavLink}
                key={`menu-item-${viewableRoute}`}
                to={viewableRoute}
                tabIndex="-1"
              >
                {t(`navigationBar.${value.translateId}`)}
              </Menu.Item>
            )
          })
        }
        {this.renderUserMenu(itemWidth)}
        <Menu.Item
          style={{ width: `${itemWidth}%` }}
        >
          <Button icon="bullhorn" onClick={() => Sentry.showReportDialog()} />
        </Menu.Item>
        {asUser ?
          <Menu.Item
            style={{ width: `${itemWidth}%` }}
          >
            <Button onClick={this.returnToSelf()}>Stop mocking as {asUser}</Button>
          </Menu.Item>
          : null}
      </Menu>)
  }
}

NavigationBar.propTypes = {
  translate: func.isRequired,
  asUser: string,
  history: shape({
    push: func.isRequired
  }).isRequired
}

NavigationBar.defaultProps = {
  asUser: null
}

const mapStateToProps = ({ settings }) => ({
  asUser: settings.asUser
})

export default connect(mapStateToProps)(withRouter(NavigationBar))
