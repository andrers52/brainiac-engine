BE.UnitTests.ArrayUtilTestCase = function() {

    let a,b,c,d,e;

    function Val(val) {
        this.val = val;
        this.toString = function(){return this.val;};
    };
    function equalTest(m,n) {return m.val === n.val;};
    function getVal(v) {return v.val;};


    this.initiate = function() {
        a = [1,2,3];
        b = [3,4,5];
        c = [1,2,3,4,4];
        d = [1,2,3,4,4];
        e = [1,2];
    };

    this.testAdd = function() {
        let aa = a.clone();
        aa.push(b[0]);
        aa.push(b[1]);
        aa.push(b[2]);
        BE.UnitTests.testSuite.assertSame(a.add(b).toString(), aa.toString());
    };

    this.testClone = function() {
        let aa = a.clone();
        BE.UnitTests.testSuite.assertSame(a[0],aa[0]);
        aa[0] = 111;
        BE.UnitTests.testSuite.assertNotSame(aa[0], a[0]);
    };

    this.testCloneWithFunction = function() {
        let origin = new BE.Vector();
        let OneOne = new BE.Vector(1,1);
        let array = [origin, OneOne];
        let clonedArray = array.clone(BE.Vector.clone);

        let modifiedOriginToOneOneOne = origin.set(1,1);

        BE.UnitTests.testSuite.assertSame(OneOne.toString(), modifiedOriginToOneOneOne.toString());

        BE.UnitTests.testSuite.assertSame(OneOne.toString(), array[0].toString());

        BE.UnitTests.testSuite.assertSame((new BE.Vector()).toString(), clonedArray[0].toString());
    };


    this.testIsIncluded = function() {
        BE.UnitTests.testSuite.assertTrue(a.isIncluded(2));
    };

    this.testIsNotIncluded = function() {
        BE.UnitTests.testSuite.assertFalse(a.isIncluded(4));
    };

    this.testArrayIsIncludedInsideArray = function() {
        BE.UnitTests.testSuite.assertTrue(a.isIncluded(e));
    };

    this.testArrayIsNotIncludedInsideArray = function() {
        BE.UnitTests.testSuite.assertFalse(a.isIncluded(b));
    };

    this.testFirstElement = function() {
        BE.UnitTests.testSuite.assertSame(a.first(), 1);
        BE.UnitTests.testSuite.assertSame(b.first(), 3);
        BE.UnitTests.testSuite.assertSame(c.first(), 1);
        BE.UnitTests.testSuite.assertSame(d.first(), 1);
        BE.UnitTests.testSuite.assertSame(e.first(), 1);
    };

    this.testLastElement = function() {
        BE.UnitTests.testSuite.assertSame(a.last(), 3);
        BE.UnitTests.testSuite.assertSame(b.last(), 5);
        BE.UnitTests.testSuite.assertSame(c.last(), 4);
        BE.UnitTests.testSuite.assertSame(d.last(), 4);
        BE.UnitTests.testSuite.assertSame(e.last(), 2);
    };

    this.testLastIndex = function() {
        BE.UnitTests.testSuite.assertSame(a.lastIndex(), 2);
        BE.UnitTests.testSuite.assertSame(b.lastIndex(), 2);
        BE.UnitTests.testSuite.assertSame(c.lastIndex(), 4);
        BE.UnitTests.testSuite.assertSame(d.lastIndex(), 4);
        BE.UnitTests.testSuite.assertSame(e.lastIndex(), 1);
    };

    this.testIsIncludedWithEqualFunction = function() {
        function equal(obj1,obj2) {
            return obj1.val == obj2.val;
        };

        let object1 = {val: 1};
        let object2 = {val: 1};
        let object3 = {val: 2};

        BE.UnitTests.testSuite.assertTrue(equal(object1, object2));
        BE.UnitTests.testSuite.assertFalse(equal(object1, object3));

        let array = [object1];
        BE.UnitTests.testSuite.assertTrue(array.isIncluded(object1, equal));
        BE.UnitTests.testSuite.assertTrue(array.isIncluded(object2, equal));
        BE.UnitTests.testSuite.assertFalse(array.isIncluded(object3, equal));

        BE.UnitTests.testSuite.assertTrue(array.isIncluded(object1));
        BE.UnitTests.testSuite.assertFalse(array.isIncluded(object2));
        BE.UnitTests.testSuite.assertFalse(array.isIncluded(object3));

    };

    this.testIntersection = function() {
        BE.UnitTests.testSuite.assertSame(a.intersection(b)[0],3);
    };

    this.testIntersectionWithCustomEqualityFunction = function() {
        let a = [new Val(1), new Val(2), new Val(3)];
        let b = [new Val(1), new Val(2)];
        let expectedResult = [new Val(1), new Val(2)];

        BE.UnitTests.testSuite.assertSame(a.intersection(b, equalTest).toString(), expectedResult.toString());
    };


    this.testSubtract = function() {
        let x = a.subtract(b);
        BE.UnitTests.testSuite.assertSame(x[0],1);
        BE.UnitTests.testSuite.assertSame(x[1],2);
    };

    this.testSubtractWithCustomEqualityFunction = function() {

        let a = [new Val(1), new Val(2), new Val(3)];
        let b = [new Val(1), new Val(2)];
        let expectedResult = [new Val(3)];

        BE.UnitTests.testSuite.assertSame(a.subtract(b, equalTest).toString(), expectedResult.toString());
    };


    this.testAsSetIsSet = function() {
        BE.UnitTests.testSuite.assertTrue(c.asSet().isSet());
    };

    this.testEqual = function() {
        BE.UnitTests.testSuite.assertTrue( (!a.isEqual(b)) && (!b.isEqual(c)) && (c.isEqual(d)) );
    };

    this.testEqualWithCustomFunction = function() {
        let a = [{val: 1}, {val: 2}, {val: 3}];
        let b = [{val: 1}, {val: 2}, {val: 3}];

        BE.UnitTests.testSuite.assertTrue(a.isEqual(b, equalTest));
    };

    this.testNotEqualWithCustomFunction = function() {
        let a = [{val: 1}, {val: 2}, {val: 4}];
        let b = [{val: 1}, {val: 2}, {val: 3}];

        BE.UnitTests.testSuite.assertFalse(a.isEqual(b, equalTest));
    };

    this.testMapOnto = function() {
        let array1 = [1,2,3];
        let array2 = [4,5,6];
        let expectedResultArray = [5,7,9];
        let resultArray = array1.mapOver(array2, function(a,b) {return a + b;} );
        BE.UnitTests.testSuite.assertSame(resultArray.toString(), expectedResultArray.toString());
    };

    this.testSumAll = function() {
        let array = [1,2,3];
        let expectedSum = 6;
        let resultSum = array.sumAll();
        BE.UnitTests.testSuite.assertSame(resultSum, expectedSum);
    };

    this.testSumAllWithCustomMethod = function() {
        let a = [{val: 1}, {val: 2}, {val: 4}];
        let expectedSum = 7;
        let resultSum = a.sumAll(getVal);
        BE.UnitTests.testSuite.assertSame(resultSum, expectedSum);
    };


    this.testMakeAritmeticProgression = function() {
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(2,2).toString(), [2].toString());
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(0,2).toString(), [0,1,2].toString());
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(0,2,1).toString(), [0,1,2].toString());
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(2,0).toString(), [2,1,0].toString());
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(0,6,2).toString(), [0,2,4,6].toString());
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(0,7,2).toString(), [0,2,4,6].toString());
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(6,0,2).toString(), [6,4,2,0].toString());
        BE.UnitTests.testSuite.assertSame(BE.Array.makeAritmeticProgression(6,-1,2).toString(), [6,4,2,0].toString());
    };


    this.testSameElements = function() {
        BE.UnitTests.testSuite.assertTrue([2].isSame([2]));
        BE.UnitTests.testSuite.assertTrue([1,2].isSame([1,2]));
        BE.UnitTests.testSuite.assertFalse([1,2].isEqual([2,1]));
        BE.UnitTests.testSuite.assertTrue([1,2].isSame([2,1]));
        BE.UnitTests.testSuite.assertFalse([1,1,2].isSame([2,1]));
        BE.UnitTests.testSuite.assertTrue([1,1,2].asSet().isSame([2,1]));
    };

}

BE.UnitTests.testSuite.add("BE.UnitTests.ArrayUtilTestCase");
