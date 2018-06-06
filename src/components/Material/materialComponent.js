import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, FormControl, Form, FormGroup, ListGroup } from 'react-bootstrap'
import './Material.css'
import { FormattedMessage } from 'react-intl'

export default class MaterialComponent extends Component {

  constructor (props) {
    super(props)
    this.state = {
      show: false,
      searchQuery: ''
    }
  }

  handleClose = () => {
    this.setState({show: false})
  }

  handleShow = () => {
    this.setState({show: true})
    if (this.props.materials.length === 0) {
      this.props.loadMaterials()
    }
  }

  handleSearch = (event) => {
    this.setState({
      searchQuery: event.target.value.toLowerCase()
    })
  }

  choose = (event) => {
    event.stopPropagation()
    let {currentTarget: {dataset: {dbKey}}} = event
    const material = this.props.materials.find(item => item._key === dbKey)
    this.props.setMaterial(material, this.props.activeObject)
    this.handleClose()
  }

  render () {
    const MaterialComponent = ({dbKey, name, density, lambda, epsilon, color}) => {
      let bgcolor = {backgroundColor: color.toString()}
      return (
        <li className="list-group-flush" data-db-key={dbKey} onClick={this.choose}>
          <h4>{name}</h4>
          <span>Density: {density}</span>
          <span>Lambda: {lambda}</span>
          <span>Epsilon: {epsilon}</span>
          <span className="color" style={bgcolor}></span>
        </li>
      )
    }

    const {materials} = this.props

    return (
      <div className="material">

        <FormattedMessage id='material.btnMaterialTitle' defaultMessage='Set material'>
          {title =>
            <button onClick={this.handleShow} title={title} className='add-material' />
          }
        </FormattedMessage>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <FormattedMessage id='material.modal.title' defaultMessage='Choose material'>
              {value =>
                <Modal.Title>{value}</Modal.Title>
              }
            </FormattedMessage>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <FormGroup controlId="formControlsText">
                <FormattedMessage id='material.modal.searchPlaceholder' defaultMessage='Life search ...'>
                  {placeholder =>
                    <FormControl
                      type="text"
                      name="title"
                      placeholder={placeholder}
                      onChange={this.handleSearch}
                      autoFocus
                    />
                  }
                </FormattedMessage>
                <FormControl.Feedback/>
              </FormGroup>
            </Form>

            <ListGroup componentClass='ul' className='materials-list'>
              {materials &&
              materials.filter(material => {
                const searchName = `${material.name} ${material.density} ${material.epsilon} ${material.lambda}`.toLowerCase()

                return searchName.includes(this.state.searchQuery)
              }).slice(0, this.state.searchQuery ? 30 : 10).map((material) =>
                <MaterialComponent key={material._key}
                                   name={material.name}
                                   density={material.density}
                                   lambda={material.lambda}
                                   epsilon={material.epsilon}
                                   color={material.color}
                                   dbKey={material._key}
                />
              )}
            </ListGroup>

          </Modal.Body>
          <Modal.Footer>
            <FormattedMessage id='btn.cancel' defaultMessage='Cancel'>
              {value =>
                <Button onClick={this.handleClose}>{value}</Button>
              }
            </FormattedMessage>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }

  static propTypes = {
    lang: PropTypes.string.isRequired,
    scene: PropTypes.object,
    materials: PropTypes.array,
    activeObject: PropTypes.object
  }
}