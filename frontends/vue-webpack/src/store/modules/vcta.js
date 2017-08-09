import * as types from '../mutation-types'
import axios from 'axios'
let AUTH_TOKEN = 'auth_token'

axios.defaults.baseURL = 'http://localhost:8888/api/v1/'

function setAxiosToken() {
  if (localStorage.getItem(AUTH_TOKEN)) {
    axios.defaults.headers.common['Authorization'] = 'Token ' + localStorage.getItem(AUTH_TOKEN)
  }
}
setAxiosToken()

// initial state
const state = {
  trips: [
    {
      id: 1,
      date: new Date('2015-05-01'),
      distance: 5
    },
    {
      id: 2,
      date: new Date('2015-05-03'),
      distance: 5
    }
  ],
  userInfo: {
    id: 1,
    fullName: 'John Smith',
    name: 'John',
    distance: 10,
    tripCount: 2,
    days: 2,
    team: 1
  },
  scoreboard: {
    loading: true,
    individuals: [
    ],
    teams: [
    ]
  }
}

// getters
const getters = {
  trips: state => state.trips,
  userInfo: state => state.userInfo,
  scoreboard: state => state.scoreboard
}

// actions
const actions = {
  addTrip({commit}, trip) {
    commit(types.ADD_TRIP, trip)
  },
  deleteTrip({commit}, id) {
    commit(types.DELETE_TRIP, id)
  },
  getScoreboard({commit}) {
    commit(types.LOADING_SCOREBOARD)
    axios.get('custom/scoreboard/').then((response) => {
      commit(types.SUCCESS_LOAD_SCOREBOARD, response.data)
    })
  },
  getAuthToken({commit}, credentials) {
    axios.post('obtain-auth-token/', credentials).then((response) => {
      localStorage.setItem(AUTH_TOKEN, response.data.token)
      setAxiosToken()
    }).catch((err) => {
      console.error('Error getting auth token')
      console.error(err)
    })
  }
}

// mutations
let maxId = 3
function getDistinctDays(trips) {
  let days = new Set()
  for (let i = 0; i < trips.length; i++) {
    days.add(trips[i].date)
  }
  return days.size
}
const mutations = {
  [types.LOADING_SCOREBOARD](state) {
    state.scoreboard.loading = true
  },
  [types.SUCCESS_LOAD_SCOREBOARD](state, payload) {
    state.scoreboard = {loading: false, ...payload}
  },
  [types.ADD_TRIP](state, payload) {
    const newTrip = {id: maxId++, ...payload}
    state.trips.push(newTrip)
    // Update userInfo
    state.userInfo.tripCount += 1
    state.userInfo.distance += newTrip.distance
    let distinctDays = getDistinctDays(state.trips)
    state.userInfo.days = distinctDays
    // Update individuals
    let userIndex = state.scoreboard.individuals.findIndex(function(obj) {
      return obj.id === state.userInfo.id
    })
    state.scoreboard.individuals[userIndex].distance += newTrip.distance
    state.scoreboard.individuals[userIndex].days = distinctDays
    // Update team
    let teamIndex = state.scoreboard.teams.findIndex(function(obj) {
      return obj.id === state.userInfo.team
    })
    state.scoreboard.teams[teamIndex].distance += newTrip.distance
    state.scoreboard.teams[teamIndex].avgDistance =
      state.scoreboard.teams[teamIndex].distance / state.scoreboard.teams[teamIndex].memberCount
    state.scoreboard.teams[teamIndex].avgDays += 1
    // Can't calculate distinct days without the full list of trips for the team
  },
  [types.DELETE_TRIP](state, id) {
    let distanceDiff = 0
    const index = state.trips.findIndex(function(elem) {
      distanceDiff = elem.distance
      return elem.id === id
    })
    let oldTrip = state.trips[index]
    if (index > -1) {
      state.userInfo.tripCount -= 1
      state.trips.splice(index, 1)
      state.userInfo.distance -= distanceDiff
      state.userInfo.days = getDistinctDays(state.trips)
    }
    // Update individuals
    let userIndex = state.scoreboard.individuals.findIndex(function(obj) {
      return obj.id === state.userInfo.id
    })
    state.scoreboard.individuals[userIndex].distance -= oldTrip.distance
    state.scoreboard.individuals[userIndex].days = getDistinctDays(state.trips)
    // Update team
    let teamIndex = state.scoreboard.teams.findIndex(function(obj) {
      return obj.id === state.userInfo.team
    })
    state.scoreboard.teams[teamIndex].distance -= oldTrip.distance
    state.scoreboard.teams[teamIndex].avgDistance =
      state.scoreboard.teams[teamIndex].distance / state.scoreboard.teams[teamIndex].memberCount
    state.scoreboard.teams[teamIndex].avgDays -= 1
    // Can't calculate distinct days without the full list of trips for the team
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
