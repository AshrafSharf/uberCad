import { connect } from 'react-redux'
import OptionsComponent from './optionsComponent'
import {
  isEdit,
  setSelectMode,
  setSingleLayerSelect,
  setThreshold
} from '../../actions/options'
import { calculate } from '../../actions/calculate'

const mapStateToProps = (state, ownProps) => {
  return {
    scene: state.cad.scene,
    tool: state.toolbar.tool,
    editMode: state.cad.editMode,
    selectMode: state.options.selectMode,
    singleLayerSelect: state.options.singleLayerSelect,
    threshold: state.options.threshold,
    ...ownProps
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectMode: function (mode) {
      setSelectMode(mode)(dispatch)
    },

    setSingleLayerSelect: function (value) {
      setSingleLayerSelect(value)(dispatch)
    },

    setThreshold: function (value) {
      setThreshold(value)(dispatch)
    },
    isEdit: function (option) {
      isEdit(option)(dispatch)
    },
    calculate: (scene) => {
      calculate(scene)(dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OptionsComponent)
