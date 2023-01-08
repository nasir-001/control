import { createMetaMixin } from 'quasar'
import packageInfo from '../../package.json'
// eslint-disable-next-line
import jwt_decode from 'jwt-decode'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
// import relativeTime from 'dayjs/plugin/relativeTime'



function getMetaData(pageTitle) {
  const metaData = {
    title: `${pageTitle}`,
    titleTemplate: title => `${title} | ${packageInfo.productName}`
  }
  return createMetaMixin(metaData)
}

function hasPermission (token, permission) {
  const permsList = window.localStorage.getItem('permissionsList')
  let hasPerm = -1
  // eslint-disable-next-line
  const authPayload = jwt_decode(token)
  const now = new Date()
  // Delete expired token
  if (Math.floor(now.getTime() / 1000) > authPayload.exp) {
    window.localStorage.removeItem('permissionsList')
    window.localStorage.removeItem('authToken')
    window.location.replace('/')
  } else if (permsList === null) {
    window.localStorage.removeItem('authToken')
    window.location.replace('/')
  }
  if (permsList !== null) {
    hasPerm = permsList.indexOf(permission)
  }
  return hasPerm > -1
}


function formatDate (date) {
  const dateFromAPI = new Date(date)
  dayjs.extend(advancedFormat)
  const formattedDate = dayjs(dateFromAPI).format('Do MMM, YYYY')
  return formattedDate.toUpperCase()
}


function validateEmail (val) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return (re.test(val) || 'Please enter a valid email.')
}

function hasPermissionFromList (permList, permission) {
  const hasperm = permList.indexOf(permission)
  return hasperm >= 0
}

function filterByName(rows, terms) {
  for (const term in terms) {
    rows = rows.filter(row =>
      (row.unit[term] + '').toLowerCase().indexOf(terms[term].toLowerCase()) !== -1
    );
  };
  return rows;
};

function filterUnitByWard(rows, terms) {
  for (const term in terms) {
    rows = rows.filter(row =>
      (row[term] + '').toLowerCase().indexOf(terms[term].toLowerCase()) !== -1
    );
  };
  return rows;
};

function sumVote(votes) {
  let count = 0
  for (let i = 0; i < votes.length; i++) {
    count += votes[i].vote
  }
  return count
}

function unitResult (resultList, uuid) {
  for (let i = 0; i < resultList.length; i++) {
    if (resultList[i].unit.uuid == uuid) {
      return resultList[i].vote
    } else {
      return 0
    }
  }
}

export {
  getMetaData,
  hasPermission,
  validateEmail,
  hasPermissionFromList,
  formatDate,
  sumVote,
  filterByName,
  filterUnitByWard,
  unitResult
}