import { connect } from 'react-redux'
import CadComponent from './cadComponent'
import { fetchProject } from '../../actions/project'
import { drawDxf, cadClick } from '../../actions/cad'
import { spinnerShow, spinnerHide } from '../../actions/spinner'
import { TOOL_POINT } from '../Toolbar/toolbarComponent'

const mapStateToProps = (state, ownProps) => {
  return {
    editor: {
      scene: state.cad.scene,
      camera: state.cad.camera,
      renderer: state.cad.renderer,
      cadCanvas: state.cad.cadCanvas,
      tool: state.toolbar.tool,
      activeEntities: state.cad.activeEntities,
      options: {
        selectMode: 'new'//state.options.mode
      },
      editMode: {
        isEdit: false
      }
    },

    loading: state.project.loading,
    error: state.project.error,
    project: state.project.project,
    ...ownProps
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchProject: function (id) {
      fetchProject(id)(dispatch)
    },
    // fetchDxf: function (url) {
    //   fetchDxf(url)(dispatch)
    // },

    spinnerShow: function () {
      spinnerShow()(dispatch)
    },

    spinnerHide: function () {
      spinnerHide()(dispatch)
    },

    // parseDxf: function (dxf) {
    //   parseDxf(dxf)(dispatch)
    // }

    drawDxf: (data, container) => {
      drawDxf(data, container)(dispatch)
    },

    onClick: (event, editor) => {
      cadClick(event, editor)(dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CadComponent)
