import DxfParser from 'dxf-parser'
import dxfService from './../services/dxfService'
import sceneService from './../services/sceneService'
import { TOOL_POINT } from '../components/Toolbar/toolbarComponent'

export const CAD_PARSE_DXF = 'CAD_PARSE_DXF'
export const CAD_DRAW_DXF = 'CAD_DRAW_DXF'
export const CAD_CLICK = 'CAD_CLICK'
export const CAD_DO_SELECTION = 'CAD_DO_SELECTION'
export const CAD_TOGGLE_VISIBLE = 'CAD_TOGGLE_VISIBLE'

export const drawDxf = (data, container) => {
  let cadCanvas = new dxfService.Viewer(data, container)
  let scene = cadCanvas.getScene()
  let camera = cadCanvas.getCamera()
  let renderer = cadCanvas.getRenderer()

  container.appendChild(renderer.domElement)

  return dispatch => dispatch({
    type: CAD_DRAW_DXF,
    payload: {
      scene,
      camera,
      renderer,
      cadCanvas
    }
  })
}

export const cadClick = (event, editor) => {
  return dispatch => {
    let {scene, camera, tool} = editor

    switch (tool) {
      case TOOL_POINT: {
        let clickResult = sceneService.onClick(event, scene, camera)
        console.log(`Click position [${clickResult.point.x.toFixed(4)}, ${clickResult.point.y.toFixed(4)}]`, clickResult)

        let payload = {
          ...clickResult,
          object: null
        }

        let selectResult = clickResult.activeEntities
        // $scope.editor.lastClickResult.activeEntities = ArrayUtils.clone(clickResult.activeEntities);

        if (selectResult.length) {
          // check if entity belongs to object
          if (selectResult[0].userData.belongsToObject) {
            payload.object = selectResult[0].parent
          }
        }

        if (!editor.editMode.isEdit) {
          let activeEntities = sceneService.doSelection(selectResult, editor)
          dispatch({
            type: CAD_DO_SELECTION,
            payload: {
              activeEntities
            }
          })
        }
        // else {
        //   if (clickResult.activeEntities.length > 0 &&
        //     !$scope.editor.editMode.activeLine.hasOwnProperty('id') &&
        //     !$scope.editor.editMode.newLine.active &&
        //     !$scope.editor.editMode.newArc.active&&
        //     (clickResult.activeEntities[0].parent.uuid === $scope.editor.editMode.uuid ||
        //       clickResult.activeEntities[0].uuid === $scope.editor.editMode.uuid)
        //   ) {
        //     $scope.editGeometry(clickResult.activeEntities[0]);
        //   } else {
        //     //do nothing
        //   }
        // }

        // console.log('Click RESULT', clickResult)

        dispatch({
          type: CAD_CLICK,
          payload
        })
      }
        break
      default:
        console.log(`cadClick not handled for tool: ${tool}`)
        break
    }
  }
}

export const cadDoubleClick = (event, editor) => {
  return dispatch => {
    let {scene, camera, tool} = editor

    // console.warn('Double click: TODO recursive select entities')

    switch (tool) {
      case TOOL_POINT:
        if (!editor.editMode.isEdit) {
          let clickResult = sceneService.onClick(event, scene, camera)
          console.log(`DOUBLE Click position [${clickResult.point.x.toFixed(4)}, ${clickResult.point.y.toFixed(4)}]`, clickResult)

          if (clickResult.activeEntities.length) {
            console.log('has active entities')
            // check if entity belongs to object
            let activeEntities
            if (clickResult.activeEntities[0].userData.belongsToObject) {
              // completely select object
              // $scope.editor.activeEntities = $scope.editor.activeEntities[0].parent.children;
              activeEntities = clickResult.activeEntities[0].parent.children
            } else {
              activeEntities = sceneService.recursiveSelect(clickResult.activeEntities[0], editor)
            }

            sceneService.doSelection(activeEntities, editor)
            dispatch({
              type: CAD_DO_SELECTION,
              payload: {
                activeEntities
              }
            })
          }
        }

        break
      default:
        console.log(`cadDoubleClick not handled for tool: ${tool}`)
        break
    }
  }
}

export const parseDxf = dxf => {
  let parser = new DxfParser()
  return dispatch => dispatch({
    type: CAD_PARSE_DXF,
    payload: {
      parsedData: parser.parseSync(dxf)
    }
  })
}
