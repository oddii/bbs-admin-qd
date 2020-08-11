import {
    createStore,
    combineReducers
} from 'redux'

import {} from 'redux-thunk'

import commonReducer from './reducers/common'
import userReducer from './reducers/user'

const reducers = combineReducers({
    commonReducer,
    userReducer
})

const store = createStore(reducers)

export default store