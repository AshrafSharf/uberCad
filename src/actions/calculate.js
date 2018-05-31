import Api from '../services/apiService'
import GeometryUtils from '../services/GeometryUtils'

import { spinnerShow, spinnerHide } from './spinner'

export const CALCULATE = 'CALCULATE'
export const CALCULATE_HIDE = 'CALCULATE_HIDE'

export const calculate = (scene) => {
  const objects = scene.children[1].children
  const info = []
  const polyamideObjects = []

  objects.forEach(object => {
    if (object.userData.material.material === 'polyamide') {
      const geometry = GeometryUtils.getObjectInfo(object)
      let data = {
        area: geometry[0].region.area,
        height: geometry[0].region.height,
        width: geometry[0].region.width,
        weight: object.userData.material.density * geometry[0].region.area / 1000000
      }
      data.type = geometry.length > 1 ? 2 : 1
      info.push(data)

      polyamideObjects.push(object)
    } else {
      //nothing
    }
  })
  return (dispatch) => {
    dispatch(spinnerShow())
    Api.post('/api/calculate', {data: info})
      .then(res => {
          res.forEach((price, i) => {
            polyamideObjects[i].userData.price = price
            polyamideObjects[i].userData.info = info[i]

          })
          dispatch(spinnerHide())
          dispatch({
            type: CALCULATE,
            payload: {
              prices: res,
              polyamideObjects,
              info
            }
          })
        }
      )
  }
}

export const calculateHide = () => {
  return dispatch => dispatch({
    type: CALCULATE_HIDE
  })
}
