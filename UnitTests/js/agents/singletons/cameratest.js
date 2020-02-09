BE.UnitTests.CameraTestCase = function() {

  this.testCreate = function() {
    let camera = BE.camera();
        BE.UnitTests.testSuite.assertTrue(camera !== null);
        BE.UnitTests.testSuite.assertFalse(camera.isSolid);
  };

  this.testApi = function() {
    let camera = BE.camera();
        BE.UnitTests.testSuite.assertTrue(camera.drawImagee !== null, "camera.drawImage not found");
        BE.UnitTests.testSuite.assertTrue(camera.onResizeCanvas !== null, "camera.onResizeCanvas not found");
        BE.UnitTests.testSuite.assertTrue(camera.start !== null, "camera.start not found");
        //TODO: IMPLEMENT THIS AFTER CREATING A DISTINCTION BETWEEN WORLD, CAMERA AND CANVAS SIZE
        //BE.UnitTests.testSuite.assertTrue(camera.zoomOut !== null);
        //BE.UnitTests.testSuite.assertTrue(camera.zoomIn !== null);
  };

}

BE.UnitTests.testSuite.add("BE.UnitTests.CameraTestCase");
