import { combineReducers, createStore } from 'redux'
import _ from 'lodash'
import { routerReducer } from 'react-router-redux'
import ConfigManager from 'browser/main/lib/ConfigManager'

/**
 * Repositories
 * ```
 * repositories = [{
 *   key: String,
 *   name: String,
 *   path: String, // path of repository
 *   status: String, // status of repository [IDLE, LOADING, READY, ERROR]
 *   folders: {
 *     name: String,
 *     color: String
 *   },
 *   notes: [{
 *     key: String,
 *     title: String,
 *     content: String,
 *     folder: String,
 *     tags: [String],
 *     createdAt: Date,
 *     updatedAt: Date
 *   }]
 * }]
 * ```
 */
const initialRepositories = []

function repositories (state = initialRepositories, action) {
  console.info('REDUX >> ', action)
  switch (action.type) {
    case 'INIT_ALL':
      action.data.forEach((repo) => {
        repo.notes.forEach((note) => {
          note._repository = repo
        })
      })
      return action.data.slice()
    case 'ADD_REPOSITORY':
      {
        let repos = state.slice()

        repos.push(action.repository)

        return repos
      }
    case 'REMOVE_REPOSITORY':
      {
        let repos = state.slice()

        let targetIndex = _.findIndex(repos, {key: action.key})
        if (targetIndex > -1) {
          repos.splice(targetIndex, 1)
        }

        return repos
      }
    case 'ADD_FOLDER':
      {
        let repos = state.slice()
        let targetRepo = _.find(repos, {key: action.key})

        if (targetRepo == null) return state

        let targetFolderIndex = _.findIndex(targetRepo.folders, {key: action.folder.key})
        if (targetFolderIndex < 0) {
          targetRepo.folders.push(action.folder)
        } else {
          targetRepo.folders.splice(targetFolderIndex, 1, action.folder)
        }

        return repos
      }
    case 'EDIT_FOLDER':
      {
        let repos = state.slice()
        let targetRepo = _.find(repos, {key: action.key})

        if (targetRepo == null) return state

        let targetFolderIndex = _.findIndex(targetRepo.folders, {key: action.folder.key})
        if (targetFolderIndex < 0) {
          targetRepo.folders.push(action.folder)
        } else {
          targetRepo.folders.splice(targetFolderIndex, 1, action.folder)
        }

        return repos
      }
    /**
     *  Remove a folder from the repository
     * {
     *  type: 'REMOVE_FOLDER',
     *  repository: repositoryKey,
     *  folder: folderKey
     * }
     */
    case 'REMOVE_FOLDER':
      {
        let repos = state.slice()
        let targetRepo = _.find(repos, {key: action.repository})

        if (targetRepo == null) return state

        let targetFolderIndex = _.findIndex(targetRepo.folders, {key: action.folder})
        if (targetFolderIndex > -1) {
          targetRepo.folders.splice(targetFolderIndex, 1)
        }

        return repos
      }
    case 'ADD_NOTE':
      {
        let repos = state.slice()
        let targetRepo = _.find(repos, {key: action.repository})

        if (targetRepo == null) return state
        action.note._repository = targetRepo
        targetRepo.notes.push(action.note)

        return repos
      }
    case 'SAVE_NOTE':
      {
        let repos = state.slice()
        let targetRepo = _.find(repos, {key: action.repository})

        if (targetRepo == null) return state

        let targetNoteIndex = _.findIndex(targetRepo.notes, {key: action.note.key})
        action.note.updatedAt = Date.now()
        action.note._repository = targetRepo

        if (targetNoteIndex > -1) {
          targetRepo.notes.splice(targetNoteIndex, 1, action.note)
        } else {
          targetRepo.notes.push(action.note)
        }

        return repos
      }
    case 'STAR_NOTE':
      {
        let repos = state.slice()
        let targetRepo = _.find(repos, {key: action.repository})

        if (targetRepo == null) return state

        let targetNoteIndex = _.findIndex(targetRepo.notes, {key: action.note})
        if (targetNoteIndex > -1) {
          targetRepo.starred.push(action.note)
          targetRepo.starred = _.uniq(targetRepo.starred)
        } else {
          return state
        }

        return repos
      }
    case 'UNSTAR_NOTE':
      {
        let repos = state.slice()
        let targetRepo = _.find(repos, {key: action.repository})

        if (targetRepo == null) return state

        targetRepo.starred = targetRepo.starred
          .filter((starredKey) => starredKey !== action.note)
        targetRepo.starred = _.uniq(targetRepo.starred)

        return repos
      }
  }
  return state
}

const defaultConfig = ConfigManager.get()

function config (state = defaultConfig, action) {
  switch (action.type) {
    case 'SET_IS_SIDENAV_FOLDED':
      state.isSideNavFolded = action.isFolded
      return Object.assign({}, state)
    case 'SET_ZOOM':
      state.zoom = action.zoom
      return Object.assign({}, state)
    case 'SET_LIST_WIDTH':
      state.listWidth = action.listWidth
      return Object.assign({}, state)
    case 'SET_CONFIG':
      return Object.assign({}, state, action.config)
  }
  return state
}

let reducer = combineReducers({
  repositories,
  config,
  routing: routerReducer
})

let store = createStore(reducer)

export default store
