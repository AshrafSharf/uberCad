import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import './Chamfer.css'
import { CHAMFER_LENGTH_ANGLE, CHAMFER_TWO_LENGTH, ROUNDING_LENGTH, ROUNDING_RADIUS } from '../../../actions/chamfer'

export default class chamferComponent extends Component {
  onChangeMode = ({currentTarget: {value}}) => {
    this.props.setSelectMode(value)
  }
  inputChange = (event) => {
    let {currentTarget: {dataset: {name}}} = event
    this.props.inputChange(name, event.target.value, this.props.mode)
  }

  render () {
    const {mode, options} = this.props
    return (
      <Fragment>
        <div className='tools-chamfer'>
          <label>Chamfer & rounding tool: </label>
          <label>
            <input type='radio' className='two-length'
                   title='Chamfer two length'
                   value={CHAMFER_TWO_LENGTH}
                   checked={mode === CHAMFER_TWO_LENGTH}
                   onChange={this.onChangeMode}/>
          </label>
          <label>
            <input type='radio' className='length-angle'
                   title='Chamfer by length & angle'
                   value={CHAMFER_LENGTH_ANGLE}
                   checked={mode === CHAMFER_LENGTH_ANGLE}
                   onChange={this.onChangeMode}/>
          </label>
          <label>
            <input type='radio' className='rounding-radius'
                   title='Rounding by radius'
                   value={ROUNDING_RADIUS}
                   checked={mode === ROUNDING_RADIUS}
                   onChange={this.onChangeMode}/>
          </label>
          <label>
            <input type='radio' className='rounding-length'
                   title='Rounding by length'
                   value={ROUNDING_LENGTH}
                   checked={mode === ROUNDING_LENGTH}
                   onChange={this.onChangeMode}/>
          </label>
        </div>

        {mode === CHAMFER_TWO_LENGTH &&
        <div className='chamfer-options'>
          <label>First line length
            <input type="number"
                   value={options.twoLength.lengthOne}
                   data-name='lengthOne'
                   onChange={this.inputChange}/>
          </label>
          <label>Second line length
            <input type="number"
                   value={options.twoLength.lengthTwo}
                   data-name='lengthTwo'
                   onChange={this.inputChange}/>
          </label>
        </div>
        }

        {mode === CHAMFER_LENGTH_ANGLE &&
        <div className='chamfer-options'>
          <label>First line length
            <input type="number"
                   value={options.lengthAngle.length}
                   data-name='length'
                   onChange={this.inputChange}/>
          </label>
          <label>Angle
            <input type="number"
                   value={options.lengthAngle.angle}
                   data-name='angle'
                   onChange={this.inputChange}/>
          </label>
        </div>
        }

        {mode === ROUNDING_RADIUS &&
        <div className='chamfer-options'>
          <label>Radius
            <input type="number"
                   value={options.rounding.radius}
                   data-name='radius'
                   onChange={this.inputChange}/>
          </label>
        </div>
        }

        {mode === ROUNDING_LENGTH &&
        <div className='chamfer-options'>
          <label>Length
            <input type="number"
                   value={options.roundingLength.length}
                   data-name='length'
                   onChange={this.inputChange}/>
          </label>
        </div>
        }

      </Fragment>
    )
  }

  static propTypes = {
    mode: PropTypes.string.isRequired,
    setSelectMode: PropTypes.func
  }
}