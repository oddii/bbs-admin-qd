import {
    createStore,
    combineReducers
} from 'redux'

import {} from 'redux-thunk'

import commonReducer from './reducers/common'

const reducers = combineReducers({
    commonReducer
})

const store = createStore(reducers)

export default store