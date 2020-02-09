BE.UnitTests.ResourceStoreTestCase = function() {

    this.testGetInstance = function() {
        BE.UnitTests.testSuite.assertTrue(BE.resourceStore !== undefined);
    };

    this.testInstancePublicMethods = function() {
        let resourceStore = BE.resourceStore;
        BE.UnitTests.testSuite.assertTrue(resourceStore.addResource !== undefined);
    };

    // function waitToLoadResources() {
    //     if (BE.resourceStore.isReady()) {
    //         return;
    //     }
    //     setTimeout(function(){waitToLoadResources();},200);
    // };

    this.testAddAndRetrieve = function() {
        let url = "media/images/bubble.png";
        BE.resourceStore.addResource(url);
        BE.resourceStore.executeAfterLoad(function resume(){
            let result = BE.resourceStore.retrieveResourceObject(url);
            BE.UnitTests.testSuite.assertTrue(result instanceof Image);
          });
    };

}

BE.UnitTests.testSuite.add("BE.UnitTests.ResourceStoreTestCase");
