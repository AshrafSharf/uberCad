// ICONS: https://www.flaticon.com/free-icon/computer-mouse-cursor_70358#term=cursor&page=1&position=11

import React, { Component } from 'react'
import './Toolbar.css'
import toolPoint from './point.svg'
import toolSelect from './select.svg'
import toolUndo from './undo.svg'
import toolRedo from './redo.svg'
import toolLine from './line.svg'
import toolArc from './curve.svg'
import toolChamfer from './chamfer.svg'
import toolRectangle from './rectangle.svg'
import toolMeasurement from './measurement.svg'
import toolGrid from './grid.svg'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

export const TOOL_POINT = 'TOOL_POINT'
export const TOOL_SELECT = 'TOOL_SELECT'
export const TOOL_UNDO = 'TOOL_UNDO'
export const TOOL_REDO = 'TOOL_REDO'
export const TOOL_ARC = 'TOOL_ARC'
export const TOOL_MEASUREMENT = 'TOOL_MEASUREMENT'
export const TOOL_LINE = 'TOOL_LINE'
export const TOOL_RECTANGLE = 'TOOL_RECTANGLE'
export const TOOL_CHAMFER = 'TOOL_CHAMFER'
export const TOOL_GRID = 'TOOL_GRID'

export default class ToolbarComponent extends Component {
  onClick = ({currentTarget: {dataset: {tool}}}) => {
    this.props.chooseTool(tool)
  }

  render () {
    const {tool, editor, history, back, forward} = this.props

    return (
      <div id='toolbar'>
        <FormattedMessage id='toolbar.point' defaultMessage='Point (v)'>
          {value =>
            <button className={`btn ${tool === TOOL_POINT ? 'btn-success' : ''}`}
                    data-tool={TOOL_POINT}
                    onClick={this.onClick}
                    title={value}
            >
              <img src={toolPoint} alt='Point'/>
            </button>
          }
        </FormattedMessage>

        <FormattedMessage id='toolbar.select' defaultMessage='Select (m)'>
          {value =>
            <button className={`btn ${tool === TOOL_SELECT ? 'btn-success' : ''}`}
                    data-tool={TOOL_SELECT}
                    onClick={this.onClick}
                    title={value}
            >
              <img src={toolSelect} alt='Select'/>
            </button>
          }
        </FormattedMessage>

        <button className={`btn ${tool === TOOL_MEASUREMENT ? 'btn-success' : ''}`}
                data-tool={TOOL_MEASUREMENT}
                onClick={this.onClick}
                title='Measurement'
        >
          <img src={toolMeasurement} alt='Measurement'/>
        </button>

        <FormattedMessage id='toolbar.undo' defaultMessage='Undo'>
          {value =>
            <button className={`btn ${history.index < 0 ? 'disabled' : ''}`}
                    data-tool={TOOL_UNDO}
                    onClick={() => history.index >= 0 ? back(history, editor) : console.log('no back history')}
                    title={value}
            >
              <img src={toolUndo} alt='Undo'/>
            </button>
          }
        </FormattedMessage>

        <FormattedMessage id='toolbar.redo' defaultMessage='Redo'>
          {value => <button
              className={`btn ${history.index >= history.changes.length - 1 ? 'disabled' : ''}`}
              data-tool={TOOL_REDO}
              onClick={() => history.index < history.changes.length - 1 ? forward(history, editor) : console.log('head of the history button')}
              title={value}
            >
              <img src={toolRedo} alt='Redo'/>
            </button>
          }
        </FormattedMessage>

        <button className={`btn ${tool === TOOL_LINE ? 'btn-success' : ''}`}
                data-tool={TOOL_LINE}
                onClick={this.onClick}
                title='Line'
        >
          <img src={toolLine} alt='Line'/>
        </button>

        <button className={`btn ${tool === TOOL_ARC ? 'btn-success' : ''}`}
                data-tool={TOOL_ARC}
                onClick={this.onClick}
                title='Arc'
        >
          <img src={toolArc} alt='Arc'/>
        </button>

        <button className={`btn ${tool === TOOL_CHAMFER ? 'btn-success' : ''}`}
                data-tool={TOOL_CHAMFER}
                onClick={this.onClick}
                title='Chamfer & rounding'
        >
          <img src={toolChamfer} alt='Chamfer'/>
        </button>

        <button className={`btn ${tool === TOOL_RECTANGLE ? 'btn-success' : ''}`}
                data-tool={TOOL_RECTANGLE}
                onClick={this.onClick}
                title='Rectangle'
        >
          <img src={toolRectangle} alt='Rectangle'/>
        </button>

        <button className={`btn ${tool === TOOL_GRID ? 'btn-success' : ''}`}
                data-tool={TOOL_GRID}
                onClick={this.onClick}
                title='Grid'
        >
          <img src={toolGrid} alt='Grid'/>
        </button>

        {/* <button className="btn" id="back" type="submit" disabled="true" ng-click="back()" title="Back"><i */}
        {/* class="fa fa-rotate-left"></i></button> */}
        {/* <button className="btn" id="forward" type="submit" disabled="true" ng-click="forward()" title="Forward"><i */}
        {/* class="fa fa-rotate-right"></i></button> */}

        {/* <button className="btn" ng-class="{'btn-success': tools.eraser == editor.tool}" */}
        {/* ng-click="selectTool(tools.eraser)" */}
        {/* title="Erase (e)"><i class="fa fa-trash-o"></i></button> */}

        {/* <!--line--> */}
        {/* <!--arc--> */}
        {/* <!--ruler or measure tool--> */}
        {/* <!--mirror--> */}

        {/* <button className="btn" title="Snapshots"><i class="fa fa-code-fork"></i></button> */}
        {/* <button className="btn" title="Rotate"><i class="fa fa-refresh"></i></button> */}
        {/* <button className="btn" title="Info"><i class="fa fa-info-circle" aria-hidden="true"></i></button> */}

        {/* <button className="btn" title="Object group"><i class="fa fa-object-group" aria-hidden="true"></i></button> */}
        {/* <button className="btn" title="Object ungroup"><i class="fa fa-object-ungroup" aria-hidden="true"></i></button> */}

        {/* <button className="btn" title="Move"><i class="fa fa-hand-paper-o" aria-hidden="true"></i></button> */}
        {/* <button className="btn" title="Zoom"><i class="fa fa-search" aria-hidden="true"></i></button> */}

        {/* <!-- <button className="btn" title="Zoom In"><i class="fa fa-search-plus" aria-hidden="true"></i></button> --> */}
        {/* <!-- <button className="btn" title="Zoom Out"><i class="fa fa-search-minus" aria-hidden="true"></i></i> < /button> --> */}
      </div>

    )
  }

  static propTypes = {
    lang: PropTypes.string.isRequired
    // tool: PropTypes.object.isRequired,
  }
}
