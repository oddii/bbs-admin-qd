import {
    ACTIONS
} from '../../constant'

const initState = {}

const userReducer = (state = initState, action) => {
    switch (action.type) {
        case ACTIONS.SET_USER_DATA:
            return Object.assign(state, action.user)
        default:
            return state
    }
}

export default userReducer