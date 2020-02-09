"use strict";
BE.UnitTests.TestSuite = function() {

    let testCasesToRun, lastTestAssertOk, pageContainer;

    this.setupMethodName = "setUp"; //runs at start of testsuit
    this.initiateMethodName = "initiate"; //runs at start of each test case
    this.finalizeMethodName = "finalize"; //runs at end of each test case
    this.tearDownMethodName = "tearDown"; //runs at end of testsuit


    //TODO: CREATE HTML UTIL?
    function addTextToPage (text) {
        try {
            if(pageContainer === 'body') {
                let a = 1;
            }
            document.getElementById(pageContainer).innerHTML += '<p align="center"> ' + text + " </p> ";
        }
        catch (err) {
            let a = 1;
        }
    }

    function h1Text (text) {
        return '<h1 align="center">' + text + "</h1>";
    }

    function greenText (text) {
        return "<span style=\"color:green;\">" + text + "</span>";
    }

    function redText (text) {
        return "<span style=\"color:red;\">" + text + "</span>";
    }

    function getObjectFromName (objectName) {
        return eval("new " + objectName + "();");
    }

    function clear () {
        testCasesToRun = {};
        lastTestAssertOk = true;
        pageContainer = "messages";
    }

    function getTestMethodNames (objectToTest)
    {
        let methodsFound = [];
        let allMethods = Object.getOwnPropertyNames(objectToTest);
        for (let i = 0; i < allMethods.length; i++) {
            let methodName = allMethods[i];
            if((typeof objectToTest[methodName] === "function") && methodName.includes("test") ) {
                methodsFound.push(methodName);
            }
        }
        return methodsFound;
    }

    function runTestCaseSupportMethod (testCase, supportMethodName) {
        if(testCase[supportMethodName]) {
            try {
                testCase[supportMethodName].call(testCase);
            } catch (err) {
                addTextToPage(redText(supportMethodName + " error: " + err));
                return false;
            }
        }
        return true;
    }

    function runTestCase (testCaseName) {

        let testCaseToRun = getObjectFromName(testCaseName);
        let testCaseRunOk = true;

        if(!runTestCaseSupportMethod(testCaseToRun, this.setupMethodName)) return false;

        for (let index = 0; index < testCasesToRun[testCaseName].length; index++) {

            if(!runTestCaseSupportMethod(testCaseToRun, this.initiateMethodName)) return false;

            //TODO: REFACTORING -> CREATE RUN TEST METHOD
            let testBeingExecuted = testCasesToRun[testCaseName][index];
            lastTestAssertOk = true;
            try {
                testCaseToRun[testBeingExecuted].call(testCaseToRun);
            } catch (err) {
                addTextToPage(redText(testBeingExecuted + " error: " + err));
                lastTestAssertOk = false;
                testCaseRunOk = false;
            }
            if (!lastTestAssertOk) {
                testCaseRunOk = false;
            }
            addTextToPage(testBeingExecuted + " " + (lastTestAssertOk? greenText("passed") : redText("failed")));


            if(!runTestCaseSupportMethod(testCaseToRun, this.finalizeMethodName)) return false;

        }

        if(!runTestCaseSupportMethod(testCaseToRun, this.tearDownMethodName)) return false;

        return testCaseRunOk;
    }


    this.run =  function () {
        for (let testCaseName in testCasesToRun) {
            addTextToPage(h1Text(testCaseName));
            addTextToPage(testCaseName + " " + (runTestCase.call(this, testCaseName)? greenText("passed") : redText("failed")));
        }
        clear();
    };

    this.add =  function (testCaseName) {
        testCasesToRun[testCaseName] = getTestMethodNames(getObjectFromName(testCaseName));
    };


    // *** TODO: USE ARSLIB -> UTIL -> ASSERT ***
    this.assertTrue = function (expression, message) {
        message = message || "Expected true condition";
        if(!expression) {
            addTextToPage(redText(" error: " + message));
            lastTestAssertOk = false;
      throw "";
        }
    };

    this.assertFalse = function (expression, message) {
        message = message || "Expected false condition";
        this.assertTrue(!expression, message);
    };

    this.assertSame = function (received, expected) {
        if(received !== expected) {
      let message = "error: received " + received + " expected " + expected;
            addTextToPage(redText(message));
            lastTestAssertOk = false;
      throw "";
        }
    };


    this.assertNotSame = function (received, expected) {
        if(received === expected) {
      let message = "error: expected differente, but received identical -> " + received;
            addTextToPage(redText(message));
            lastTestAssertOk = false;
      throw "";
        }
    };


    this.assertNotEqualTo = function (expression, expectedNotToBeValue, message) {
        message = message || "Should NOT be equal to " + expectedNotToBeValue;
        if(expression === expectedNotToBeValue) {
      let message = " error: " + message;
            addTextToPage(redText(message));
            lastTestAssertOk = false;
      throw "";
        }
    };

    this.assertNotUndefined = function (expression, message) {
        message = message || "Should NOT be undefined";
        this.assertNotEqualTo(expression, 'undefined', message);
    };

    this.assertNotNull = function (expression, message) {
        message = message || "Should NOT be null";
        this.assertNotEqualTo(expression, null, message);
    };

    this.assertIsFunction = function(functionToTest, message) {
      message = message || "Error: expecting a function";
    this.assert(typeof functionToTest === 'function', message);
  };


    this.setPageContainer = function (pageContainerToUse) {
        pageContainer = pageContainerToUse;
    };

    (clear());
}

//suppport static method to simulate mouse actions
BE.UnitTests.TestSuite.mouseGenerateEvent = function(eventString, canvasPositionX, canvasPositionY) {
  BE.assert(["click", "mousedown", "mouseup", "mouseover", "mousemove", "mouseout"].includes(eventString));
  let canvas = BE.screen.getCanvas();
  let evt = document.createEvent("MouseEvents");
  windowPositionX = canvasPositionX + canvas.offsetLeft - window.pageXOffset;
  windowPositionY = canvasPositionY + canvas.offsetTop - window.pageYOffset;
  evt.initMouseEvent(eventString, true, true, window, 1, 0, 0, windowPositionX, windowPositionY, false, false, false, false, 0, null);
  canvas.dispatchEvent(evt);
  BE.userEvents.propagate(); //this is necessary to garantee events are propagated before gameLoops starts
}


BE.UnitTests.testSuite = new BE.UnitTests.TestSuite();
