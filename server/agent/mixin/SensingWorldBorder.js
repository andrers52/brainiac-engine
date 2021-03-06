'use strict'
import Assert from '../../../../arslib/util/assert.js'
import Vector from '../../../common/geometry/Vector.js'
import {environment} from '../../singleton/BEServer.js'


//generated event (receives one or more directions ["UP","DOWN","LEFT","RIGHT"])
//onSensingWorldBorder(directionsArray)

export default function SensingWorldBorder (sensingDistanceInput) {
  Assert.assert(this.onSensingWorldBorder, 'Error: added SensingWorldBorder to agent without implementing onSensingWorldBorder event handler')

  let DEFAULT_SENSING_DISTANCE = 50
  let sensingDistance = sensingDistanceInput || DEFAULT_SENSING_DISTANCE
  let self = this

  let upVector = new Vector(0, sensingDistance)
  let downVector = new Vector(0, -sensingDistance)
  let leftVector = new Vector(-sensingDistance,0)
  let rightVector = new Vector(sensingDistance,0)

  function getSensingBorderDirections() {
    //RETURN null or relative collision vector
    let resultVector = new Vector()

    let upPosition = 
      self.getPosition().clone()
        .add(upVector)
    let downPosition = 
      self.getPosition().clone()
        .subtract(downVector)
    let leftPosition = 
      self.getPosition().clone()
        .subtract(leftVector)
    let rightPosition = 
      self.getPosition().clone()
        .add(rightVector)

    if(!environment.getWorldRectangle().checkPointInside(upPosition))
      resultVector.add(upVector)
    if(!environment.getWorldRectangle().checkPointInside(downPosition))
      resultVector.add(downVector)
    if(!environment.getWorldRectangle().checkPointInside(leftPosition))
      resultVector.add(leftVector)
    if(!environment.getWorldRectangle().checkPointInside(rightPosition))
      resultVector.add(rightVector)

    return (resultVector.equal(new Vector()))? null : resultVector
  }
  //replace move
  (() => {
    let originalMove = this.move
    this.move = function(distance, force) {
      let relativeCollisionVector = getSensingBorderDirections();
      (relativeCollisionVector) && this.onSensingWorldBorder(relativeCollisionVector)
      return originalMove.call(this, distance, force)
    }
  })()

}

