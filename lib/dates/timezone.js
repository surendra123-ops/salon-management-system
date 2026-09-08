const TIMEZONE = "Asia/Kolkata"
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/**
 * Get date string (YYYY-MM-DD) for the IST (Asia/Kolkata) representation of a Date.
 * Computed as UTC date parts shifted by IST offset to avoid locale quirks.
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} - YYYY-MM-DD in Asia/Kolkata
 */
const toISTDateString = (date) => {
  const d = new Date(date.getTime ? date.getTime() : date)
  const ist = new Date(d.getTime() + IST_OFFSET_MS)
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0")
  const day = String(ist.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Get start of day in Asia/Kolkata for a given date string (YYYY-MM-DD)
 * Returns a Date whose UTC value corresponds to 00:00:00.000 IST.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date}
 */
const getStartOfDay = (dateStr) => {
  return new Date(dateStr + "T00:00:00+05:30")
}

/**
 * Get exclusive end of day (start of next day) in Asia/Kolkata.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date}
 */
const getEndOfDay = (dateStr) => {
  const d = getStartOfDay(dateStr)
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000)
  return d
}

/**
 * Today's date string in Asia/Kolkata (YYYY-MM-DD)
 * @returns {string}
 */
const getToday = () => {
  return toISTDateString(new Date())
}

/**
 * Yesterday's date string in Asia/Kolkata (YYYY-MM-DD)
 * @returns {string}
 */
const getYesterday = () => {
  const d = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
  return toISTDateString(d)
}

/**
 * Start of current week (Monday) in Asia/Kolkata (YYYY-MM-DD)
 * @returns {string}
 */
const getWeekStart = () => {
  const todayStr = getToday()
  const noon = new Date(todayStr + "T12:00:00+05:30")
  const day = noon.getUTCDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(noon.getTime() - diff * 24 * 60 * 60 * 1000)
  return toISTDateString(monday)
}

/**
 * Start of current month in Asia/Kolkata (YYYY-MM-01)
 * @returns {string}
 */
const getMonthStart = () => {
  const todayStr = getToday()
  return todayStr.slice(0, 8) + "01"
}

/**
 * First and last day of previous month in Asia/Kolkata
 * @returns {{ from: string, to: string }} - YYYY-MM-DD
 */
const getLastMonth = () => {
  const currentMonthStart = getMonthStart()
  const firstOfCurrent = new Date(currentMonthStart + "T00:00:00+05:30")
  const lastOfPrev = new Date(firstOfCurrent.getTime() - 24 * 60 * 60 * 1000)
  const lastOfPrevStr = toISTDateString(lastOfPrev)
  return {
    from: lastOfPrevStr.slice(0, 8) + "01",
    to: lastOfPrevStr,
  }
}

/**
 * Resolve a named range or custom date range to { from, to, fromISO, toISO }.
 * fromISO/toISO are exclusive-boundary Dates for MongoDB queries:
 * createdAt >= fromISO and createdAt < toISO.
 * @param {string} range - today | yesterday | this-week | this-month | last-month
 * @param {string} from - custom from (YYYY-MM-DD)
 * @param {string} to - custom to (YYYY-MM-DD)
 * @returns {{ from: string, to: string, fromISO: Date, toISO: Date }}
 */
const resolveDateRange = (range, from, to) => {
  let resolvedFrom, resolvedTo

  switch (range) {
    case "today":
      resolvedFrom = getToday()
      resolvedTo = getToday()
      break
    case "yesterday":
      resolvedFrom = getYesterday()
      resolvedTo = getYesterday()
      break
    case "this-week":
      resolvedFrom = getWeekStart()
      resolvedTo = getToday()
      break
    case "last-month": {
      const lm = getLastMonth()
      resolvedFrom = lm.from
      resolvedTo = lm.to
      break
    }
    case "this-month":
      resolvedFrom = getMonthStart()
      resolvedTo = getToday()
      break
    default:
      if (from && to) {
        resolvedFrom = from
        resolvedTo = to
      } else {
        resolvedFrom = getToday()
        resolvedTo = getToday()
      }
  }

  return {
    from: resolvedFrom,
    to: resolvedTo,
    fromISO: getStartOfDay(resolvedFrom),
    toISO: getEndOfDay(resolvedTo),
  }
}

module.exports = {
  TIMEZONE,
  toISTDateString,
  getStartOfDay,
  getEndOfDay,
  getToday,
  getYesterday,
  getWeekStart,
  getMonthStart,
  getLastMonth,
  resolveDateRange,
}