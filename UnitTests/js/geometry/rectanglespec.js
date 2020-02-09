describe("Rectangle", function() {
  it("should be created as type Rectangle", function() {
    expect(new BE.Rectangle() instanceof BE.Rectangle).toBeTruthy();;
  });

  it("should provide a constructor with default values", function() {
      let rectangle = new BE.Rectangle();
      expect(rectangle.topLeft().x).toEqual(0);
      expect(rectangle.topLeft().y).toEqual(0);
      expect(rectangle.bottomRight().x).toEqual(0);
      expect(rectangle.bottomRight().y).toEqual(0);
  });



  it("should provide a constructor defining initial values", function() {
      let rectangle = new BE.Rectangle(new BE.Vector(), new BE.Vector(10,10));

      expect(rectangle.topLeft().x).toEqual(-5);
      expect(rectangle.topLeft().y).toEqual(5);

      expect(rectangle.bottomRight().x).toEqual(5);
      expect(rectangle.bottomRight().y).toEqual(-5);

      expect(rectangle.topRight().x).toEqual(5);
      expect(rectangle.topRight().y).toEqual(5);

      expect(rectangle.bottomLeft().x).toEqual(-5);
      expect(rectangle.bottomLeft().y).toEqual(-5);
  });

    it("should check point is inside rectangle", function() {
      let rectangle = new BE.Rectangle(new BE.Vector(10,10), new BE.Vector(10,10));

      expect(rectangle.checkPointInside(new BE.Vector(5,5))).toBeTruthy();
      expect(rectangle.checkPointInside(new BE.Vector(15,5))).toBeTruthy();
      expect(rectangle.checkPointInside(new BE.Vector(15,15))).toBeTruthy();
      expect(rectangle.checkPointInside(new BE.Vector(5,15))).toBeTruthy();
    });


    it("should have its center inside itself", function() {
        let rectangle = new BE.Rectangle(new BE.Vector(10,10), new BE.Vector(10,10));
        expect(rectangle.checkPointInside(rectangle.center)).toBeTruthy();
    });

    it("should detect a smaller rectangle at its position is inside it", function() {
        let internalRectangle =
          new BE.Rectangle(
            new BE.Vector(0,0),
            new BE.Vector(1,1));
        let externalRectangle =
          new BE.Rectangle(
            new BE.Vector(0,0),
            new BE.Vector(2,2));
        expect(externalRectangle.checkInside(internalRectangle)).toBeTruthy();
      });

    it("should detect a rectangle in its right upper corner as being inside it.", function() {
        let internalRectangle =
          new BE.Rectangle(
            new BE.Vector(0.5,0.5),
            new BE.Vector(1,1));

        let externalRectangle =
          new BE.Rectangle(
            new BE.Vector(0,0),
            new BE.Vector(2,2));

        expect(externalRectangle.checkInside(internalRectangle)).toBeTruthy();
      });

      it("should detect a rectangle in its left upper corner as being inside it.", function() {
          let internalRectangle =
            new BE.Rectangle(
              new BE.Vector(-0.5,0.5),
              new BE.Vector(1,1));

          let externalRectangle =
            new BE.Rectangle(
              new BE.Vector(0,0),
              new BE.Vector(2,2));

          expect(externalRectangle.checkInside(internalRectangle)).toBeTruthy();
        });

        it("should detect a rectangle in its left bottom corner as being inside it.", function() {
            let internalRectangle =
              new BE.Rectangle(
                new BE.Vector(-0.5,-0.5),
                new BE.Vector(1,1));

            let externalRectangle =
              new BE.Rectangle(
                new BE.Vector(0,0),
                new BE.Vector(2,2));

            expect(externalRectangle.checkInside(internalRectangle)).toBeTruthy();
          });

          it("should detect a rectangle in its right bottom corner as being inside it.", function() {
              let internalRectangle =
                new BE.Rectangle(
                  new BE.Vector(0.5,-0.5),
                  new BE.Vector(1,1));

              let externalRectangle =
                new BE.Rectangle(
                  new BE.Vector(0,0),
                  new BE.Vector(2,2));

              expect(externalRectangle.checkInside(internalRectangle)).toBeTruthy();
            });

          it("should detect a position is outside.", function() {
                let rectangle = new BE.Rectangle(new BE.Vector(10,10), new BE.Vector(10,10));

                expect(rectangle.checkPointInside(new BE.Vector(20,20))).toBeFalsy();
                expect(rectangle.checkPointInside(new BE.Vector(5,20))).toBeFalsy();
                expect(rectangle.checkPointInside(new BE.Vector(20,15))).toBeFalsy();
          });

          it("should move from position to position + vector", function() {
                  let center1 = new BE.Vector(10,10);
                  let size = new BE.Vector(20,20);
                  let moveDistance = new BE.Vector(30,30);
                  let rectangle1 = new BE.Rectangle(center1, size);
                  let rectangle2 = rectangle1.clone();
                  rectangle2.move(moveDistance);
                  let center2 = center1.clone().add(moveDistance);

                  expect(rectangle1.center.equal(center1)).toBeTruthy();
                   expect(rectangle2.center.equal(center2)).toBeTruthy();
          });


          it("should detect intersection with another rectangle", function() {
                  let center = new BE.Vector(0,0);
                  let size = new BE.Vector(20,20);
                  let rectangleOutside = new BE.Rectangle(center, size);
                  let rectangleInside = new BE.Rectangle(center, size.clone().divideByScalar(2));

                  //inside, not intersecting
                  expect(rectangleOutside.checkIntersection(rectangleInside)).toBeFalsy();

                  let center2 = new BE.Vector(10,10);
                  let intersectingRectangle = new BE.Rectangle(center2, size);
                  expect(rectangleOutside.checkIntersection(intersectingRectangle)).toBeTruthy();
          });




});

//
//
//   this.testNoIntersection = function() {
//     let center1 = new BE.Vector(0,0);
//     let center2 = new BE.Vector(10,10);
//     let size = new BE.Vector(2,2);
//     let rectangle1 = new BE.Rectangle(center1, size);
//     let rectangle2 = new BE.Rectangle(center2, size);
//
//     let greaterX = BE.Rectangle.pickGreaterX(rectangle1,rectangle2);
//     let greaterY = BE.Rectangle.pickGreaterX(rectangle1,rectangle2);
//     let smallerX = BE.Rectangle.pickSmallerX(rectangle1,rectangle2);
//     let smallerY = BE.Rectangle.pickSmallerX(rectangle1,rectangle2);
//
//     BE.UnitTests.testSuite.assertFalse(rectangle1.checkIntersection(rectangle2));
//   };
//
//   this.testClone = function() {
//     let center = new BE.Vector(0,0);
//     let size = new BE.Vector(2,2);
//     let rectangle1 = new BE.Rectangle(center, size);
//     let rectangle2 = rectangle1.clone();
//
//     BE.UnitTests.testSuite.assertTrue(rectangle1.center.equal(rectangle2.center));
//     BE.UnitTests.testSuite.assertTrue(rectangle1.size.equal(rectangle2.size));
//   };
//
//
//   this.testPickGreaterSmallerYX = function() {
//     let center1 = new BE.Vector(0,0);
//     let center2 = new BE.Vector(10,10);
//     let size1 = new BE.Vector(1,2);
//     let size2 = new BE.Vector(2,1);
//     let rectangle1 = new BE.Rectangle(center1, size1);
//     let rectangle2 = new BE.Rectangle(center2, size2);
//     BE.UnitTests.testSuite.assertSame(BE.Rectangle.pickGreaterX(rectangle1,rectangle2).toString(), rectangle2.toString());
//     BE.UnitTests.testSuite.assertSame(BE.Rectangle.pickGreaterY(rectangle1,rectangle2).toString(), rectangle1.toString());
//     BE.UnitTests.testSuite.assertSame(BE.Rectangle.pickSmallerX(rectangle1,rectangle2).toString(), rectangle1.toString());
//     BE.UnitTests.testSuite.assertSame(BE.Rectangle.pickSmallerY(rectangle1,rectangle2).toString(), rectangle2.toString());
//   };
//
//
//   this.testIntersectionWithoutCornerInside = function() {
//     let origin = new BE.Vector(0,0);
//     let size1 = new BE.Vector(20,5);
//     let size2 = new BE.Vector(5,20);
//     let rectangle1 = new BE.Rectangle(origin, size1);
//     let rectangle2 = new BE.Rectangle(origin, size2);
//
//     let greaterX = BE.Rectangle.pickGreaterX(rectangle1,rectangle2);
//     let greaterY = BE.Rectangle.pickGreaterY(rectangle1,rectangle2);
//     let smallerX = BE.Rectangle.pickSmallerX(rectangle1,rectangle2);
//     let smallerY = BE.Rectangle.pickSmallerY(rectangle1,rectangle2);
//
//     BE.UnitTests.testSuite.assertTrue(rectangle1.checkIntersection(rectangle2));
//   };
//
//   this.testMakeFromCorners = function() {
//     let bottomLeft = new BE.Vector(0,0);
//     let topRight = new BE.Vector(2,1);
//     let result = BE.Rectangle.makeFromCorners(bottomLeft, topRight);
//     let expectedCenter = new BE.Vector(1,0.5);
//     BE.UnitTests.testSuite.assertSame(result.bottomLeft().toString(), bottomLeft.toString());
//     BE.UnitTests.testSuite.assertSame(result.topRight().toString(), topRight.toString());
//     BE.UnitTests.testSuite.assertSame(result.getCenter().toString(), expectedCenter.toString());
//   };
//
//   //bottom left == (-5, -5)
//   //top right == (5, 5)
//   //center == (0, 0)
//   this.testPositionPercentage = function() {
//     let rectangleSize = new BE.Vector(10,10);
//     let rectangle = new BE.Rectangle(null, rectangleSize);
//     let bottomLeft = new BE.Vector(-5,-5);
//     let topRight = new BE.Vector(5,5);
//     let percentageOfBottomLeft = rectangle.positionPercentage(bottomLeft);
//     BE.UnitTests.testSuite.assertSame(percentageOfBottomLeft.toString(), (new BE.Vector(0, 0)).toString());
//     let percentageOfTopRight = rectangle.positionPercentage(topRight);
//     BE.UnitTests.testSuite.assertSame(percentageOfTopRight.toString(), (new BE.Vector(100, 100)).toString());
//     let percentageOfCenter = rectangle.positionPercentage(rectangle.center);
//     BE.UnitTests.testSuite.assertSame(percentageOfCenter.toString(), (new BE.Vector(50, 50)).toString());
//   };
//
//   //bottom left == (-5, -5)
//   //top right == (5, 5)
//   //center == (0, 0)
//   this.testSizePercentageToPosition = function() {
//     let rectangleSize = new BE.Vector(10,10);
//     let rectangle = new BE.Rectangle(null, rectangleSize);
//     let expectedBottomLeftPosition = new BE.Vector(-5,-5);
//     let expectedTopRightPosition = new BE.Vector(5,5);
//     let expectedCenterPosition = new BE.Vector(0,0);
//
//     let bottomLeftPercentage = new BE.Vector(0,0);
//     let topRightPercentage = new BE.Vector(100,100);
//     let centerPercentage = new BE.Vector(50,50);
//
//     let bottomLeftPosition = rectangle.sizePercentageToPosition(bottomLeftPercentage);
//     BE.UnitTests.testSuite.assertSame(bottomLeftPosition.toString(), expectedBottomLeftPosition.toString());
//     let topRightPosition = rectangle.sizePercentageToPosition(topRightPercentage);
//     BE.UnitTests.testSuite.assertSame(topRightPosition.toString(), expectedTopRightPosition.toString());
//     let centerPosition = rectangle.sizePercentageToPosition(centerPercentage);
//     BE.UnitTests.testSuite.assertSame(centerPosition.toString(), expectedCenterPosition.toString());
//   };
//
//
//   this.testMakeFromCollectionOfRectangles = function() {
//     //1 - test from two rectangles inside one another
//     let enclosingRectangleSize = new BE.Vector(10,10);
//     let enclosedRectangleSize = new BE.Vector(5,5);
//     let enclosingRectangle = new BE.Rectangle(null, enclosingRectangleSize);
//     let enclosedRectangle = new BE.Rectangle(null, enclosedRectangleSize);
//
//     let allEncompasingRectangle1 =
//       BE.Rectangle.makeFromCollectionOfRectangles([enclosingRectangle,enclosedRectangle]);
//
//     BE.UnitTests.testSuite.assertSame(allEncompasingRectangle1.center.toString(), enclosingRectangle.center.toString());
//     BE.UnitTests.testSuite.assertSame(allEncompasingRectangle1.size.toString(), enclosingRectangle.size.toString());
//
//     //2 - test from separated rectangles
//     let rectangle1 = new BE.Rectangle(null, new BE.Vector(10,10));
//     let rectangle2 = new BE.Rectangle(new BE.Vector(5,5), new BE.Vector(10,10));
//     let expectedEncompassingRectangle = new BE.Rectangle(new BE.Vector(2.5,2.5), new BE.Vector(15,15));
//     let allEncompasingRectangle2 =
//       BE.Rectangle.makeFromCollectionOfRectangles([rectangle1,rectangle2]);
//
//     BE.UnitTests.testSuite.assertSame(allEncompasingRectangle2.center.toString(), expectedEncompassingRectangle.center.toString());
//     BE.UnitTests.testSuite.assertSame(allEncompasingRectangle2.size.toString(), expectedEncompassingRectangle.size.toString());
//
//   };
//
//
// // ------------------------------------------------------------------------------------
//
//   this.testSetPosition = function() {
//
//     let baseRect = BE.rect(0,0,100,100);
//     let rect = BE.rect(0,0,10,10);
//
//     rect.setPosition(baseRect.center);
//     BE.UnitTests.testSuite.assertSame(rect.center.toString(), baseRect.center.toString());
//
//     rect.setPosition(baseRect.bottomLeft(), "bottomLeft");
//     BE.UnitTests.testSuite.assertSame(
//       rect.bottomLeft().toString(),
//       baseRect.bottomLeft().toString(),
//       "bottomLeft error");
//
//     rect.setPosition(baseRect.topLeft(), "topLeft");
//     BE.UnitTests.testSuite.assertSame(
//       rect.topLeft().toString(),
//       baseRect.topLeft().toString(),
//       "topLeft error");
//
//     rect.setPosition(baseRect.bottomRight(), "bottomRight");
//     BE.UnitTests.testSuite.assertSame(
//       rect.bottomRight().toString(),
//       baseRect.bottomRight().toString(),
//       "bottomRight error");
//
//     rect.setPosition(baseRect.topRight(), "topRight");
//     BE.UnitTests.testSuite.assertSame(
//       rect.topRight().toString(),
//       baseRect.topRight().toString(),
//       "topRight error");
//
//     rect.setPosition(baseRect.bottomCenter(), "bottomCenter");
//     BE.UnitTests.testSuite.assertSame(
//       rect.bottomCenter().toString(),
//       baseRect.bottomCenter().toString(),
//       "bottomCenter error");
//
//     rect.setPosition(baseRect.topCenter(), "topCenter");
//     BE.UnitTests.testSuite.assertSame(
//       rect.topCenter().toString(),
//       baseRect.topCenter().toString(),
//       "topCenter error");
//
//     rect.setPosition(baseRect.leftCenter(), "leftCenter");
//     BE.UnitTests.testSuite.assertSame(
//       rect.leftCenter().toString(),
//       baseRect.leftCenter().toString(),
//       "leftCenter error");
//
//     rect.setPosition(baseRect.rightCenter(), "rightCenter");
//     BE.UnitTests.testSuite.assertSame(
//       rect.rightCenter().toString(),
//       baseRect.rightCenter().toString(),
//       "rightCenter error");
//   };
// }
//
