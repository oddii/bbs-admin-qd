import {
    ACTIONS
} from '../../constant'

const initState = {
    isCollapsed: false
}

const commonReducer = (state = initState, action) => {
    switch (action.type) {
        case ACTIONS.HANDLE_COLLAPSED:
            return {
                ...state, isCollapsed: !state.isCollapsed
            }
            default:
                return state
    }
}

export default commonReducer