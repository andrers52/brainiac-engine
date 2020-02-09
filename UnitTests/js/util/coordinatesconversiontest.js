BE.UnitTests.CoordinatesConversionTestCase = function() {

  // *** CAMERA AND WORLD SAME SIZE ***
  
  function setWorldAndCameraSameSize() {
    BE.Definitions.WORLD_WIDTH = 10;
    BE.Definitions.WORLD_HEIGHT = 10;
    BE.camera.rectangle.setSize(new BE.Vector(10,10));
  }

  this.testCanvasToWorldSameSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraSameSize();
    let canvasPosition = new BE.Vector();
    let worldPositionFound = BE.CoordinatesConversion.canvasToWorld(canvasPosition);
    let worldPositionExpected = BE.camera.rectangle.topLeft();
    BE.UnitTests.testSuite.assertSame(worldPositionFound.toString(), worldPositionExpected.toString());
  };

  this.testCanvasToWorldAndBackSameSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraSameSize();
    let originalCanvasPosition = new BE.Vector();
    let canvasPositionFound = 
      BE.CoordinatesConversion.worldToCanvas(
        BE.CoordinatesConversion.canvasToWorld(originalCanvasPosition));
    BE.UnitTests.testSuite.assertSame(originalCanvasPosition.toString(), canvasPositionFound.toString());
  };
  
  this.testWorldToCanvasSameSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraSameSize();
    let worldPosition = new BE.Vector();
    let worldPositionFound = BE.CoordinatesConversion.canvasToWorld(worldPosition);
    let worldPositionExpected = BE.camera.rectangle.topLeft();
    BE.UnitTests.testSuite.assertSame(worldPositionFound.toString(), worldPositionExpected.toString());
  };
  
  this.testWorldToCanvasAndBackSameSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraSameSize();
    let originalWorldPosition = new BE.Vector();
    let worldPositionFound = 
      BE.CoordinatesConversion.canvasToWorld(
        BE.CoordinatesConversion.worldToCanvas(originalWorldPosition));
    BE.UnitTests.testSuite.assertSame(originalWorldPosition.toString(), worldPositionFound.toString());
  };
  
  
  // *** CAMERA AND WORLD DIFFERENT SIZES ***

  function setWorldAndCameraDifferentSize() {
    BE.Definitions.WORLD_WIDTH = 100;
    BE.Definitions.WORLD_HEIGHT = 100;
    BE.camera.rectangle.setSize(new BE.Vector(10,10));
  }
  
  this.testCanvasToWorldDifferentSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraDifferentSize();
    let canvasPosition = new BE.Vector();
    let worldPositionFound = BE.CoordinatesConversion.canvasToWorld(canvasPosition);
    let worldPositionExpected = BE.camera.rectangle.topLeft();
    BE.UnitTests.testSuite.assertSame(worldPositionFound.toString(), worldPositionExpected.toString());
  };
  
  this.testCanvasToWorldAndBackDifferentSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraDifferentSize();
    let originalCanvasPosition = new BE.Vector();
    let canvasPositionFound = 
      BE.CoordinatesConversion.worldToCanvas(
        BE.CoordinatesConversion.canvasToWorld(originalCanvasPosition));
    BE.UnitTests.testSuite.assertSame(originalCanvasPosition.toString(), canvasPositionFound.toString());
  };


  this.testWorldToCanvasDifferentSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraDifferentSize();
    let worldPosition = new BE.Vector();
    let worldPositionFound = BE.CoordinatesConversion.canvasToWorld(worldPosition);
    let worldPositionExpected = BE.camera.rectangle.topLeft();
    BE.UnitTests.testSuite.assertSame(worldPositionFound.toString(), worldPositionExpected.toString());
  };
  
  this.testWorldToCanvasAndBackDifferentSizeCameraAtOriginPointAtOrigin = function() {
    setWorldAndCameraDifferentSize();
    let originalWorldPosition = new BE.Vector();
    let worldPositionFound = 
      BE.CoordinatesConversion.canvasToWorld(
        BE.CoordinatesConversion.worldToCanvas(originalWorldPosition));
    BE.UnitTests.testSuite.assertSame(originalWorldPosition.toString(), worldPositionFound.toString());
  };

  
}

BE.UnitTests.testSuite.add("BE.UnitTests.CoordinatesConversionTestCase");
