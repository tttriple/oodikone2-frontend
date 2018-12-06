import moment from 'moment'

const MIN_YEAR = 1899
const MAX_YEAR = 2112
const MIN_DEFAULT_YEAR = 2000
const MIN_DEFAULT_SEMESTER = '2000-01'

const isSpring = date => moment(date).month() < 7
const isPre2016Course = course => !Number.isNaN(Number(course.code.charAt(0)))
const twoDigitYear = year => year.toString().substring(2, 4)
const getSemesterText = (start, end) => `${start}-${twoDigitYear(end)}`
const getYearText = (year, spring) => (spring ? getSemesterText(year - 1, year) : getSemesterText(year, year + 1))

const getCourseYears = course => ({
  startYear: moment(course.startdate).year(),
  endYear: moment(course.max_attainment_date || course.enddate).year()
})

const getActiveYears = (course) => {
  const { startYear, endYear } = getCourseYears(course)
  const startYearText = getYearText(startYear, isSpring(course.startdate))
  const endYearText = getYearText(endYear, isSpring(course.max_attainment_date || course.enddate))

  if (endYear === MAX_YEAR && isPre2016Course(course)) {
    return `— ${getYearText(2016, false)}`
  }

  if (startYear === MIN_YEAR) {
    return `— ${endYearText}`
  }

  if (endYear === MAX_YEAR) {
    return `${startYearText} — `
  }

  return `${startYearText} — ${endYearText}`
}

const getCourseSemesters = (course) => {
  const { startYear, endYear } = getCourseYears(course)

  return {
    start: getYearText(startYear, isSpring(course.startdate)),
    end: getYearText(endYear, isSpring(course.max_attainment_date || course.enddate))
  }
}

const getStartAndEndYearValues = (course, years) => {
  const { start, end } = getCourseSemesters(course)

  const startYear = Number(start.substring(0, 4)) < MIN_DEFAULT_YEAR
    ? years.find(year => year.text === MIN_DEFAULT_SEMESTER)
    : years.find(year => year.text === start)

  const endYear = Number(start.substring(0, 4) === MAX_YEAR) ? undefined : years.find(year => year.text === end)

  const fromYear = startYear ? startYear.value : undefined
  const toYear = endYear ? endYear.value : undefined

  return { fromYear, toYear }
}

export {
  getActiveYears,
  getStartAndEndYearValues
}