BE.UnitTests.ScreenTestCase = function() {

    this.testExistingSingleton = function() {
        BE.UnitTests.testSuite.assertTrue(BE.screen !== undefined);
    };
}

BE.UnitTests.testSuite.add("BE.UnitTests.ScreenTestCase");
