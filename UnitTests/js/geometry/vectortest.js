BE.UnitTests.VectorTestCase = function() {

    this.testCreate = function() {
        BE.UnitTests.testSuite.assertTrue(new BE.Vector() instanceof BE.Vector);
    };

    this.testPointConstructorWithNoParameters = function() {
        let point = new BE.Vector();
        BE.UnitTests.testSuite.assertSame(point.x,0);
        BE.UnitTests.testSuite.assertSame(point.y,0);
    };

    this.testPointConstructorWithParameters = function() {
        let point = new BE.Vector(10,11);
        BE.UnitTests.testSuite.assertSame(point.x,10);
        BE.UnitTests.testSuite.assertSame(point.y,11);
    };

    this.testZRotate = function() {
        let point1 = new BE.Vector(0,1,0);
        let ninethDegreesInRadians = Math.PI/2;
        let point2 = point1.zRotate(ninethDegreesInRadians).round();
        //BE.logger.log("LOW", Math.round(point2.y));
        BE.UnitTests.testSuite.assertTrue(point2.x === -1);
        BE.UnitTests.testSuite.assertTrue(point2.y === 0);
        BE.UnitTests.testSuite.assertTrue(point2.z === point1.z);
    };

    this.testDistance = function() {
        let point1 = new BE.Vector(0,3);
        let point2 = new BE.Vector(4,0);
        BE.UnitTests.testSuite.assertSame(point1.distance(point2),5);
    };


    this.testSum = function() {
        let point1 = new BE.Vector(0,3);
        let point2 = new BE.Vector(4,0);
        let pointSum = point1.add(point2);
        BE.UnitTests.testSuite.assertSame(pointSum.x,4);
        BE.UnitTests.testSuite.assertSame(pointSum.y,3);
    };

    this.testSubtract = function() {
        let point1 = new BE.Vector(0,3);
        let point2 = new BE.Vector(4,0);

        let subtraction = point1.subtract(point2);
        BE.UnitTests.testSuite.assertSame(subtraction.x,-4);
        BE.UnitTests.testSuite.assertSame(subtraction.y,3);

    };

    this.testSubtractCollateralEffects = function() {
        let point1 = new BE.Vector(0,3);
        let point2 = new BE.Vector(4,0);

        let point1Clone = point1.clone();
        let point2Clone = point2.clone();

        let subtraction = point1.subtract(point2);
        BE.UnitTests.testSuite.assertSame(subtraction.x,-4);
        BE.UnitTests.testSuite.assertSame(subtraction.y,3);

        BE.UnitTests.testSuite.assertSame(point1.toString(), point1Clone.toString());
        BE.UnitTests.testSuite.assertSame(point2.toString(), point2Clone.toString());
    };


    this.testSize = function() {
        let point = new BE.Vector(3,4);
        BE.UnitTests.testSuite.assertSame(point.size(),5);
    };

    this.testAdjustToSameSize = function() {
        let point1 = new BE.Vector(3,4);
        let point2 = point1.clone().adjustToSize(5);

        BE.UnitTests.testSuite.assertSame(point1.size(),point2.size());
    };

    this.testAdjustToDifferentSize = function() {
        let point1 = new BE.Vector(3,4);
        let point2 = point1.adjustToSize(10);
        BE.UnitTests.testSuite.assertSame(10, point2.size());
    };

    this.testClone = function() {
        let origin = new BE.Vector();
        let oneOne = origin.add(new BE.Vector(1,1));
        let twoOne = origin.add(new BE.Vector(2,0));
        let otherOrigin = origin.clone();
        BE.UnitTests.testSuite.assertSame(origin.toString(), otherOrigin.toString());

        let point1 = new BE.Vector(1,1);
        BE.UnitTests.testSuite.assertTrue(point1.equal(point1.clone()));
    };

    this.testToString = function() {
        let point = new BE.Vector();
        BE.UnitTests.testSuite.assertTrue(point.toString() === "(0,0,0,1)");
        let newPoint = point.add(new BE.Vector(1,1,0,1));
        BE.UnitTests.testSuite.assertTrue(newPoint.toString() === "(1,1,0,1)");
    };

    this.testRotateVector = function() {
        let originalPosition = new BE.Vector(1,0,0,1);
        let Angle90DegreesInRadians = Math.PI/2;
        let expectedEndPosition = new BE.Vector(0, 1, 0, 1);
        BE.UnitTests.testSuite.assertSame(originalPosition.zRotate(Angle90DegreesInRadians).round().toString(),expectedEndPosition.toString());
    };

    this.testDivideByScalar = function() {
        let x,y,z;
        x = y = z = 1;
        let divisor = 2;
        let originalPosition = new BE.Vector(x,y,z);
        let expectedResult = new BE.Vector(x/divisor,y/divisor,z/divisor);
        BE.UnitTests.testSuite.assertSame(expectedResult.toString(), originalPosition.clone().divideByScalar(divisor).toString());
    };

    this.testMakeUnit = function() {
        BE.UnitTests.testSuite.assertSame(1,BE.Vector.makeUnit().x);
        BE.UnitTests.testSuite.assertSame(1,BE.Vector.makeUnit().y);
        BE.UnitTests.testSuite.assertSame(1,BE.Vector.makeUnit().z);
    };

    this.testMakeMean = function() {
        let origin = new BE.Vector();
        let twoByTwoByTwo = new BE.Vector(2,2,2);
        let oposite = twoByTwoByTwo.clone().multiplyByScalar(-1);
        BE.UnitTests.testSuite.assertSame(origin.toString(), BE.Vector.makeMean(twoByTwoByTwo,oposite).toString());
    };

    this.testFindAngleBetweenTwoVectorsUsingDotProduct = function() {
        let x = new BE.Vector(1,0,0);
        let y = new BE.Vector(0,1,0);
        BE.UnitTests.testSuite.assertSame(Math.PI/2, x.angle(y));
    };

    this.testProjectionSize = function() {
        let x = new BE.Vector(1,0,0);
        let y = new BE.Vector(0,1,0);
        BE.UnitTests.testSuite.assertSame(0, x.projectionSize(y));
    };


    this.testProjection = function() {
        let x = new BE.Vector(1,0,0);
        let xy = new BE.Vector(1,1,0);
        BE.UnitTests.testSuite.assertSame(1, xy.projectionSize(x));
        BE.UnitTests.testSuite.assertSame(x.toString(), xy.projection(x).toString());
    };

    this.testCrossProduct = function() {
        let x = new BE.Vector(1,0,0);
        let y = new BE.Vector(0,1,0);
        let z = new BE.Vector(0,0,1);
        BE.UnitTests.testSuite.assertSame(1, x.crossProduct(y).size());
        BE.UnitTests.testSuite.assertSame(z.toString(), x.crossProduct(y).toString());
    };


    this.testParallelogramArea = function() {
        let oneZero = new BE.Vector(1,0,0);
        let oneOne = new BE.Vector(1,1,0);
        let expectedArea = 1;
        BE.UnitTests.testSuite.assertSame(
                BE.Vector.parallelogramArea(oneZero, oneOne),
                expectedArea);
    };


    this.testIsFaceUp = function() {
        let oneZero = new BE.Vector(1,0,0);
        let oneOne = new BE.Vector(1,1,0);
        BE.UnitTests.testSuite.assertTrue(BE.Vector.isFaceUp(oneZero, oneOne));
    };

    this.testIsFaceDown = function() {
        let oneZero = new BE.Vector(1,0,0);
        let oneOne = new BE.Vector(1,1,0);
        BE.UnitTests.testSuite.assertFalse(BE.Vector.isFaceUp(oneOne, oneZero));
    };



    this.testConvert = function() {
        let fromBaseSize = new BE.Vector(10,10,0);
        let toBaseSize = new BE.Vector(5,5,0);
        let vectorToConvert = new BE.Vector(1,1,0);
        let expectedConvertedVector = new BE.Vector(0.5,0.5,0);
        BE.UnitTests.testSuite.assertSame(
          vectorToConvert.convert(fromBaseSize, toBaseSize).toString(),
          expectedConvertedVector.toString());
    };

}

BE.UnitTests.testSuite.add("BE.UnitTests.VectorTestCase");
