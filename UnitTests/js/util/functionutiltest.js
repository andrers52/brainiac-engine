BE.UnitTests.FunctionUtilTestCase = function() {


    this.testAggregate = function() {
        let externalVar = 0;
        let function1 = function(value) {externalVar += value; return externalVar;};
        let function2 = function(value) {externalVar += value/2; return externalVar;};

        let resultFunction = BE.Function.aggregate(function1, function2);

        let aggregateResult = resultFunction(1);

        BE.UnitTests.testSuite.assertSame(externalVar, 1.5);
        BE.UnitTests.testSuite.assertSame(aggregateResult, 1.5);
    };

    this.testCompose = function() {
        let initialArgument = 2;
        let initialFunction = function(value) {return value + 1;};
        let composingFunction = function(value) { return value / 3;};

        let functionsArray = [initialFunction, composingFunction];

        let resultFunction =
            BE.Function.compose(null, functionsArray);

        BE.UnitTests.testSuite.assertSame(resultFunction(initialArgument), (initialArgument + 1) / 3);

    };

}

BE.UnitTests.testSuite.add("BE.UnitTests.FunctionUtilTestCase");
