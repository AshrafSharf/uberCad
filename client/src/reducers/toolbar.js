// import update from 'immutability-helper'

import {
  TOOLBAR_CHOOSE_TOOL
} from '../actions/toolbar'
import { TOOL_POINT } from '../components/Toolbar/toolbarComponent'

let toolbarInitialState = {
  tool: TOOL_POINT,
}

const toolbar = (state = toolbarInitialState, action) => {
  switch (action.type) {

    case TOOLBAR_CHOOSE_TOOL:
      return {
        ...state,
        tool: action.payload.tool
      }
    default:
      return state
  }
}

export default toolbar
