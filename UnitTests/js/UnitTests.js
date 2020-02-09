BE.UnitTests = {};
BE.UnitTests.TestApp = function() {
  this.start = function() {
    BE.UnitTests.testSuite.run();
  };
};
