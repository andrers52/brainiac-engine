'use strict'

//Note2: the operations are destructive! Use clone() for protection.
export default function Vector(x=0, y=0, z=0) {
  this.x = x
  this.y = y
  this.z = z
}

Vector.prototype.set = function(x = 0, y = 0, z = 0) {
  this.x = x
  this.y = y
  this.z = z
  return this
}

Vector.prototype.copy = function(otherVector) {
  this.x = otherVector.x
  this.y = otherVector.y
  this.z = otherVector.z
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
      this.y * this.y +
      this.z * this.z)
}

Vector.prototype.normalize = function() {
  let size = this.size()
  this.x = this.x / size
  this.y = this.y / size
  this.z = this.z / size
  return this
}

Vector.prototype.vectorDistance = function(otherVector) {
  return new Vector(
    otherVector.x - this.x,
    otherVector.y - this.y,
    otherVector.z - this.z)
}
Vector.prototype.distance = function(otherVector) {
  let v0 = otherVector.x - this.x
  let v1 = otherVector.y - this.y
  let v2 = otherVector.z - this.z
  return Math.sqrt(
    v0 * v0 +
      v1 * v1 +
      v2 * v2)
}

Vector.prototype.Xdistance = function(otherVector) {
  return Math.abs(this.x - otherVector.x)
}

Vector.prototype.Ydistance = function(otherVector) {
  return Math.abs(this.y - otherVector.y)
}

Vector.prototype.Zdistance = function(otherVector) {
  return Math.abs(this.z - otherVector.z)
}

Vector.prototype.add = function(otherVector) {
  this.x = this.x + otherVector.x
  this.y = this.y + otherVector.y
  this.z = this.z + otherVector.z
  return this
}

//Note: only executes operation if inside limits.
function addWithLimitsAllOrNothing(vectorToBeChanged, otherVector, maxLimit, minLimit) {
  let x = vectorToBeChanged.x + otherVector.x
  let y = vectorToBeChanged.y + otherVector.y
  let z = vectorToBeChanged.z + otherVector.z

  if(x > maxLimit || x < minLimit || y > maxLimit || y < minLimit || z > maxLimit || z < minLimit ) return vectorToBeChanged

  vectorToBeChanged.x = x; vectorToBeChanged.y = y; vectorToBeChanged.z = z
  return vectorToBeChanged
}

//if allOrNothing is true (default) either apply all changes or none. This will distort the vector.
Vector.prototype.addWithLimits = function(otherVector, maxLimit, minLimit, allOrNothing = true) {
  if(allOrNothing) return addWithLimitsAllOrNothing(this, otherVector, maxLimit, minLimit)
    
  let newX = this.x + otherVector.x
  let newY = this.y + otherVector.y
  let newZ = this.z + otherVector.z

  if(newX > maxLimit) this.x = maxLimit
  else if(newX < minLimit) this.x = minLimit
  else this.x = newX
  if(newY > maxLimit) this.y = maxLimit
  else if(newY < minLimit) this.y = minLimit
  else this.y = newY
  if(newZ > maxLimit) this.z = maxLimit
  else if(newZ < minLimit) this.z = minLimit
  else this.z = newZ
    
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
  this.z = this.z - deltaPos.z
  return this
}

Vector.prototype.to2D = function() {
  this.z = 0
}

Vector.prototype.equal = function(otherVector) {
  return (this.x === otherVector.x && this.y === otherVector.y && this.z === otherVector.z)
}

Vector.prototype.equal2D = function(otherVector) {
  return (this.x === otherVector.x && this.y === otherVector.y)
}

Vector.prototype.clone = function() {
  return new Vector(this.x, this.y, this.z)
}

Vector.prototype.round = function() {
  this.x = Math.round(this.x)
  this.y = Math.round(this.y)
  this.z = Math.round(this.z)
  return this
}

Vector.prototype.abs = function() {
  this.x = Math.abs(this.x)
  this.y = Math.abs(this.y)
  this.z = Math.abs(this.z)
  return this
}

Vector.prototype.toString = function() {
  return '(' + this.x + ',' + this.y + ',' + this.z + ')'
}

Vector.prototype.multiplyByScalar = function(value) {
  this.x = this.x * value
  this.y = this.y * value
  this.z = this.z * value
  return this
}

Vector.prototype.divideByScalar = function(value) {
  this.x = this.x / value
  this.y = this.y / value
  this.z = this.z / value
  return this
}

Vector.prototype.dotProduct = function(otherVector) {
  return this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z
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

Vector.prototype.crossProduct = function(otherVector) {
  /*
     * from: http://www.nondot.org/sabre/graphpro/3d2.html#Vectors
     * normal vector to two other vectors.
     * result vector size equal to the area of the parrellelagram formed by the two original vectors.
     */
  return new Vector(
    this.y * otherVector.z - this.z * otherVector.y,
    this.z * otherVector.x - this.x * otherVector.z,
    this.x * otherVector.y - this.y * otherVector.x)
}


Vector.prototype.projectOverXY = function() {
  this.z = 0
  return this
}

Vector.prototype.projectOverXZ = function() {
  this.y = 0
  return this
}

Vector.prototype.projectOverYZ = function() {
  this.x = 0
  return this
}

Vector.prototype.getAngleFromXAxisOfXYProjection = function() {
  return  Math.acos(this.x / this.clone().projectOverXY().distanceFromOrigin())
}

Vector.prototype.getAngleFromXAxisOfXZProjection = function() {
  return  Math.acos(this.x / this.clone().projectOverXZ().distanceFromOrigin())
}

Vector.prototype.getAngleFromZAxisOfYZProjection = function() {
  return  Math.acos(this.z / this.clone().projectOverYZ().distanceFromOrigin())
}

Vector.prototype.XRotateOnOrigin = function(angle) {
  let resultPoint =
      Vector.make2DProjectionFromAngleAndSize(
        this.getAngleFromZAxisOfYZProjection() + angle,
        this.clone().projectOverYZ().distanceFromOrigin())
  return new Vector(this.x, resultPoint.x, resultPoint.y)
}

Vector.prototype.YRotateOnOrigin = function(angle) {
  let resultPoint =
      Vector.make2DProjectionFromAngleAndSize(
        this.getAngleFromXAxisOfXZProjection() + angle,
        this.clone().projectOverXZ().distanceFromOrigin())
  return new Vector(resultPoint.x, this.y, resultPoint.y)
}

Vector.prototype.ZRotateOnOrigin = function(angle) {
  let resultPoint =
      Vector.make2DProjectionFromAngleAndSize(
        this.getAngleFromXAxisOfXYProjection() + angle,
        this.clone().projectOverXY().distanceFromOrigin())
  return new Vector(resultPoint.x, resultPoint.y, this.z)
}

Vector.prototype.XRotateOnAxis = function(axis, angle) {
  return ((this.clone().subtract(axis)).XRotateOnOrigin(angle)).add(axis)
}

Vector.prototype.YRotateOnAxis = function(axis, angle) {
  return ((this.clone().subtract(axis)).YRotateOnOrigin(angle)).add(axis)
}

Vector.prototype.ZRotateOnAxis = function(axis, angle) {
  return ((this.clone().subtract(axis)).ZRotateOnOrigin(angle)).add(axis)
}

Vector.prototype.invert = function() {
  return this.multiplyByScalar(-1)
}

Vector.prototype.normalize = function() {
  return this.divideByScalar(this.size())
}

Vector.prototype.adjustToSize = function(targetSize) {
  return this.normalize().clone().multiplyByScalar(targetSize)
}

Vector.makeUnit = function() {
  return new Vector(1,1,1)
}

Vector.makeMean = function(vector1,vector2) {
  return (vector1.clone().add(vector2)).divideByScalar(2)
}

Vector.make2DProjectionFromAngleAndSize = function(angleFromXProjectedAxis, size) {
  return new Vector(Math.cos(angleFromXProjectedAxis) * size, Math.sin(angleFromXProjectedAxis) * size, 0)
}

Vector.makeFromAngleAndSize = function(angle, size) {
  return new Vector(Math.cos(angle) * size, Math.sin(angle) * size, 0)
}

Vector.add = function(v1,v2) {
  return v1.clone().add(v2)
}

Vector.subtract = function(subtractFrom,subtractBy) {
  return subtractFrom.clone().subtract(subtractBy)
}

Vector.parallelogramArea = function(vector1, vector2) {
  return vector1.crossProduct(vector2).size()
}

Vector.clone = function(vectorToClone) {
  return vectorToClone.clone()
}

Vector.isFaceUp = function(vector1, vector2) {
  return (vector1.clone().crossProduct(vector2).z >= 0)
}

Vector.prototype.convert = function(fromBaseSize, toBaseSize) {
  return new Vector(
    this.x * toBaseSize.x / fromBaseSize.x,
    this.y * toBaseSize.y / fromBaseSize.y,
    this.z * toBaseSize.z / fromBaseSize.z)
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
Vector.prototype.flipZ = function () {
  this.z *= -1
  return this
}


// Allows us to get a new vector from angle and magnitude
Vector.fromAngle = function (angle, magnitude) {
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle))
}

Vector.Origin = function() {
  return new Vector()
}

//alias to simplify vector creation
vect = function(x, y, z) { return new Vector(x, y, z)}


