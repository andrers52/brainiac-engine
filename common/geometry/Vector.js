'use strict'
// import Assert from '../util/assert.js'

// function isValidVector(x,y) {
//   Assert.assertIsNumber(x,'invalid vector detected!')
//   Assert.assertIsNumber(y,'invalid vector detected!')
// }
//Note: the operations are destructive! Use clone() for protection. 😏
function Vector(x=0, y=0) {
  // isValidVector(x,y)
  this.x = x
  this.y = y
}

Vector.prototype.set = function(x, y) {
  // isValidVector(x,y)
  this.x = x
  this.y = y
  return this
}

Vector.prototype.copy = function(otherVector) {
  // isValidVector(otherVector.x,otherVector.y)
  this.x = otherVector.x
  this.y = otherVector.y
  return this
}
  

Vector.prototype.zRotate = function(angle) {
  this.x = Math.cos(angle) * this.x - Math.sin(angle) * this.y
  this.y = Math.sin(angle) * this.x + Math.cos(angle) * this.y
  return this
}

Vector.prototype.size = function() {
  return Math.sqrt(
    this.x * this.x +
      this.y * this.y)
}

Vector.prototype.normalize = function() {
  let size = this.size() || 1
  this.x = this.x / size
  this.y = this.y / size
  return this
}

Vector.prototype.vectorDistance = function(otherVector) {
  return new Vector(
    otherVector.x - this.x,
    otherVector.y - this.y)
}
Vector.prototype.distance = function(otherVector) {
  let v0 = otherVector.x - this.x
  let v1 = otherVector.y - this.y
  return Math.sqrt(
    v0 * v0 +
    v1 * v1)
}

Vector.prototype.Xdistance = function(otherVector) {
  return Math.abs(this.x - otherVector.x)
}

Vector.prototype.Ydistance = function(otherVector) {
  return Math.abs(this.y - otherVector.y)
}

Vector.prototype.add = function(otherVector) {
  this.x = this.x + otherVector.x
  this.y = this.y + otherVector.y
  return this
}

//Note: only executes operation if inside limits.
function addWithLimitsAllOrNothing(vectorToBeChanged, otherVector, maxLimit, minLimit) {
  let x = vectorToBeChanged.x + otherVector.x
  let y = vectorToBeChanged.y + otherVector.y

  if(x > maxLimit || x < minLimit || y > maxLimit || y < minLimit) return vectorToBeChanged

  vectorToBeChanged.x = x; vectorToBeChanged.y = y
  return vectorToBeChanged
}

//if allOrNothing is true (default) either apply all changes or none. This will distort the vector.
Vector.prototype.addWithLimits = function(otherVector, maxLimit, minLimit, allOrNothing = true) {
  if(allOrNothing) return addWithLimitsAllOrNothing(this, otherVector, maxLimit, minLimit)
    
  let newX = this.x + otherVector.x
  let newY = this.y + otherVector.y

  if(newX > maxLimit) this.x = maxLimit
  else if(newX < minLimit) this.x = minLimit
  else this.x = newX
  if(newY > maxLimit) this.y = maxLimit
  else if(newY < minLimit) this.y = minLimit
  else this.y = newY
    
  return this
}

Vector.prototype.addWithMaxLimit = function(otherVector, maxLimit, allOrNothing = true) {
  return this.addWithLimits(otherVector, maxLimit, -Number.MAX_SAFE_INTEGER, allOrNothing)
}

Vector.prototype.addWithMinLimit = function(otherVector, minLimit, allOrNothing = true) {
  return this.addWithLimits(otherVector, Number.MAX_SAFE_INTEGER, minLimit, allOrNothing)
}
  

Vector.prototype.subtract = function(deltaPos) {
  this.x = this.x - deltaPos.x
  this.y = this.y - deltaPos.y
  return this
}

Vector.prototype.equal = function(otherVector) {
  return (this.x === otherVector.x && this.y === otherVector.y)
}

Vector.prototype.equal2D = function(otherVector) {
  return (this.x === otherVector.x && this.y === otherVector.y)
}

Vector.prototype.clone = function() {
  return new Vector(this.x, this.y)
}

Vector.prototype.round = function() {
  this.x = Math.round(this.x)
  this.y = Math.round(this.y)
  return this
}

Vector.prototype.abs = function() {
  this.x = Math.abs(this.x)
  this.y = Math.abs(this.y)
  return this
}

Vector.prototype.toString = function() {
  return '(' + this.x + ',' + this.y + ')'
}

Vector.prototype.multiplyByScalar = function(value) {
  this.x = this.x * value
  this.y = this.y * value
  return this
}

Vector.prototype.divideByScalar = function(value) {
  this.x = this.x / (value || 1)
  this.y = this.y / (value || 1)
  // isValidVector(this.x,this.y)
  return this
}

Vector.prototype.dotProduct = function(otherVector) {
  return this.x * otherVector.x + this.y * otherVector.y
}

Vector.prototype.angle = function(otherVector) {
  return Math.acos(this.clone().dotProduct(otherVector) / this.size() * otherVector.size())
}

Vector.prototype.projectionSize = function(otherVector) {
  return this.clone().dotProduct(otherVector)/otherVector.size()
}

Vector.prototype.projection = function(otherVector) {
  return otherVector.clone().multiplyByScalar(this.projectionSize(otherVector))
}


Vector.prototype.getAngleFromXAxisOfXYProjection = function() {
  return Math.acos(this.x / this.clone().projectOverXY().distanceFromOrigin())
}

Vector.prototype.invert = function() {
  return this.multiplyByScalar(-1)
}

Vector.prototype.adjustToSize = function(targetSize) {
  return this.normalize().multiplyByScalar(targetSize)
}

Vector.makeUnit = function() {
  return new Vector(1,1)
}

Vector.makeMean = function(vector1,vector2) {
  return (vector1.clone().add(vector2)).divideByScalar(2)
}

Vector.make2DProjectionFromAngleAndSize = function(angleFromXProjectedAxis, size) {
  return new Vector(Math.cos(angleFromXProjectedAxis) * size, Math.sin(angleFromXProjectedAxis) * size)
}

Vector.makeFromAngleAndSize = function(angle, size) {
  return new Vector(Math.cos(angle) * size, Math.sin(angle) * size)
}

Vector.add = function(v1,v2) {
  return v1.clone().add(v2)
}

Vector.subtract = function(subtractFrom,subtractBy) {
  return subtractFrom.clone().subtract(subtractBy)
}



Vector.clone = function(vectorToClone) {
  return vectorToClone.clone()
}

Vector.prototype.convert = function(fromBaseSize, toBaseSize) {
  return new Vector(
    this.x * toBaseSize.x / (fromBaseSize.x || 1),
    this.y * toBaseSize.y / (fromBaseSize.y || 1))
}

// Gets the angle accounting for the quadrant we're in
Vector.prototype.getAngle = function () {
  return Math.atan2(this.y,this.x)
}

Vector.prototype.flipX = function () {
  this.x *= -1
  return this
}
Vector.prototype.flipY = function () {
  this.y *= -1
  return this
}

Vector.prototype.toString = function() {
  return `(${this.x}, ${this.y})`
}

// Allows us to get a new vector from angle and magnitude
Vector.fromAngle = function (angle, magnitude) {
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle))
}

Vector.Origin = function() {
  return new Vector()
}

//alias to simplify vector creation
function vect(x, y) { 
  return new Vector(x, y)
}

export {Vector as default, vect}