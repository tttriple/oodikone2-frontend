import {
  chart1,
  chart2,
  chart3,
  chart4,
  chart5,
  chart6,
  chart7,
  chart8,
  chart9,
  chart10,
  chart11,
  chart12,
  chart13,
  chart14,
  chart15,
  chart16,
  chart17,
  chart18,
  chart19,
  chart20,
  chart21,
  chart22,
  chart23,
  chart24,
  chart25,
  chart26,
  chart27,
  chart28,
  chart29,
  chart30,
  chart31,
  chart32,
  chart33,
  chart34,
  chart35

} from '../styles/variables'
/*
lightgreen: '#90EE90',
  chartblue: '#178aa5',
  chartdarkg: '#367a1c',
  chartlgreen: '#80e061',
  chartdarkred: '#a03530',
  chartlred: '#e2726d'
*/
import { chartblue, red, green, chartdarkg, chartlgreen, chartdarkred, chartlred } from '../styles/variables/colors'

export const routes = {
  index: { route: '/' },
  populations: { menuRoute: '/populations', route: '/populations', translateId: 'populations' },
  students: { menuRoute: '/students', route: '/students/:studentNumber?', translateId: 'students' },
  courseStatistics: { menuRoute: '/coursestatistics', route: '/coursestatistics', translateId: 'courseStatistics' },
  studyProgramme: { menuRoute: '/study-programme', route: '/study-programme/:studyProgrammeId?', translateId: 'studyProgramme', reqRights: ['studyprogramme'] },
  studyProgrammeCourseGroup: { route: '/study-programme/:studyProgrammeId/course-group/:courseGroupId', translateId: 'studyProgramme', reqRights: ['studyprogramme'] },
  teachers: { menuRoute: '/teachers', route: '/teachers/:teacherid?', translateId: 'teachers', reqRights: ['teachers'] },
  users: { menuRoute: '/users', route: '/users/:userid?', translateId: 'users', reqRights: ['users'] },
  settings: { menuRoute: '/settings', route: '/settings', translateId: 'settings', reqRights: ['dev'] },
  usage: { menuRoute: '/usage', route: '/usage', translateId: 'usage', reqRights: ['usage'] },
  sandbox: { menuRoute: '/sandbox', route: '/sandbox', translateId: 'sandbox', reqRights: ['dev'] },
  oodilearn: { menuRoute: '/oodilearn', route: '/oodilearn', translateId: 'oodilearn', reqRights: ['oodilearn'] }
}

export const hiddenRoutes = {
}

const assumeBasename = () => {
  const POSSIBLE_BASENAMES = ['staging', 'testing']
  const haystack = window.location.pathname.split('/')
  const needle = haystack.find(path => POSSIBLE_BASENAMES.includes(path))
  return needle ? `/${needle}/` : '/'
}

export const BASE_PATH = assumeBasename()

export const API_BASE_PATH = `${assumeBasename()}api`

export const AVAILABLE_LANGUAGES = ['en']
export const DEFAULT_LANG = 'en'

export const DISPLAY_DATE_FORMAT = 'DD.MM.YYYY'
export const API_DATE_FORMAT = 'YYYY.MM.DD'

export const TOKEN_NAME = window.location.pathname.includes('/staging') ? 'staging_token' : window.location.pathname.includes('/testing') ? 'testing_token' : 'token' //eslint-disable-line

export const passRateCumGraphOptions = (categories, max) => ({
  chart: {
    type: 'column'
  },
  colors: [chartblue, green, red],

  title: {
    text: 'Pass rate chart'
  },

  xAxis: {
    categories
  },

  yAxis: {
    allowDecimals: false,
    title: {
      text: 'Number of Students'
    },
    max,
    floor: -max
  },

  plotOptions: {
    column: {
      stacking: 'normal',
      borderRadius: 3
    }
  }
})

export const passRateStudGraphOptions = (categories, max) => ({
  chart: {
    type: 'column'
  },
  colors: [chartblue, chartlgreen, chartdarkg, chartlred, chartdarkred],

  title: {
    text: 'Pass rate chart'
  },

  xAxis: {
    categories
  },

  yAxis: {
    allowDecimals: false,
    title: {
      text: 'Number of Students'
    },
    max,
    floor: -max
  },

  plotOptions: {
    column: {
      stacking: 'normal',
      borderRadius: 1
    }
  }
})

export const gradeGraphOptions = (categories, max) => ({
  chart: {
    type: 'column'
  },
  colors: [red, chartblue, chartblue, chartblue, chartblue, chartblue, chartblue, chartblue],

  title: {
    text: 'Grades'
  },

  legend: {
    enabled: false
  },

  xAxis: {
    categories
  },

  yAxis: {
    allowDecimals: false,
    title: {
      text: 'Number of Students'
    },
    max,
    floor: -max
  },

  plotOptions: {
    column: {
      stacking: 'normal',
      borderRadius: 2
    }
  }
})

export const CHART_COLORS = [
  chart1,
  chart2,
  chart3,
  chart4,
  chart5,
  chart6,
  chart7,
  chart8,
  chart9,
  chart10,
  chart11,
  chart12,
  chart13,
  chart14,
  chart15,
  chart16,
  chart17,
  chart18,
  chart19,
  chart20,
  chart21,
  chart22,
  chart23,
  chart24,
  chart25,
  chart26,
  chart27,
  chart28,
  chart29,
  chart30,
  chart31,
  chart32,
  chart33,
  chart34,
  chart35
]
