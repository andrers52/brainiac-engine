// Usage:
// add resources with resourceStore.addResource and call resourceStore.callWhenReady
// with a callback to be invoked when resource store has finished loading resources.

"use strict";

import { Assert, EArray, Random } from "arslib";

import { ImageUtil } from "arslib";

import { Effect } from "../image/effect/Effect.js";

function ResourceStore() {
  //resource types
  let SUPPORTED_AUDIO_SUFFIXES = ["mp3"];
  let SUPPORTED_IMAGE_SUFFIXES = ["png", "jpg", "svg"];
  let effectsDescriptor;

  function getIdentifierSuffix(identifier) {
    return EArray.last(identifier.split("."));
  }

  function getMimeType(identifier) {
    let suffix = getIdentifierSuffix(identifier);
    let resourceTypesToMime = {
      mp3: "audio/mpeg3",
      png: "image/png",
      jpg: "image/jpeg",
      svg: "image/svg+xml",
      json: "application/json",
    };
    Assert.assert(
      resourceTypesToMime.hasOwnProperty(suffix),
      `resourceStore#getMimeType suffix not found ${suffix}`,
    );
    return resourceTypesToMime[suffix];
  }

  this.resources = {};

  let resources_loading = 0;

  this.isReady = function () {
    return resources_loading <= 0;
  };

  this.executeAfterLoad = null;

  //from file "effects_descriptor.json" <- read "doc/readme.txt" for more info.
  this.createEffectsFromDescriptor = function (descriptorObj) {
    descriptorObj.images.forEach(function (newImage) {
      let newImageName = newImage.newImageName;
      let imageName = newImage.imageName;
      let size = newImage.size;
      let opacity = newImage.opacity;
      let fillColor = newImage.fillColor;
      let strokeColor = newImage.strokeColor;

      // reading effects chain
      for (const newEffect of newImage.effectsToApply) {
        let effectName = newEffect.name;
        let parameters = newEffect.parameters;
        let combineOption = newEffect.combineOption;
        Effect(
          imageName,
          size,
          opacity,
          fillColor,
          strokeColor,
          newImageName,
          effectName,
          parameters,
          combineOption,
        );
        //change vars to reuse image on next iteration
        if (!imageName && newImageName) {
          imageName = newImageName;
          newImageName = null;
          size = null;
        }
      }
    });
  };

  this.callWhenReady = function (functionToCall) {
    if (resources_loading === 0) {
      if (effectsDescriptor)
        this.createEffectsFromDescriptor(JSON.parse(effectsDescriptor));
      functionToCall();
      return;
    }

    // Not ready yet... Try again in a while
    setTimeout(() => {
      resourceStore.callWhenReady(functionToCall);
    }, 100);
  };

  function decrease_resources_counter() {
    Assert.assert(
      resources_loading > 0,
      "Error in resource loading counting in Resource Store...",
    );
    resources_loading--;
  }

  this.clearAll = function () {
    this.resources = {};
  };

  this.clearAllBut = function (resourcesToPreserveArray) {
    Object.keys(this.resources).forEach((resource) => {
      if (!resourcesToPreserveArray.includes(resource))
        this.removeResource(resource);
    });
  };

  function isType(identifier, fileExtensionsArray) {
    for (let i = 0; i < fileExtensionsArray.length; i++) {
      if (identifier.indexOf(fileExtensionsArray[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  function isAudio(identifier) {
    return isType(identifier, SUPPORTED_AUDIO_SUFFIXES);
  }

  function isImage(identifier) {
    return isType(identifier, SUPPORTED_IMAGE_SUFFIXES);
  }

  function isJSONFile(identifier) {
    return isType(identifier, [".json"]);
  }

  function isSupportedResource(identifier) {
    return isAudio(identifier) || isImage(identifier) || isJSONFile(identifier);
  }

  function storeAudioData(identifier, audioDataSrc) {
    let audio = new Audio();

    function loadCallbackOk(evt) {
      audio.removeEventListener("canplaythrough", loadCallbackOk, false);
      audio.removeEventListener("load", loadCallbackOk, false);
      resourceStore.resources[identifier] = audio;
      decrease_resources_counter();
    }

    function loadCallbackError(evt) {
      audio.removeEventListener("error", loadCallbackError, false);
      throw "Audio loading Error: " + identifier;
    }
    audio.src =
      typeof audioDataSrc === "string"
        ? audioDataSrc //file path
        : window.URL.createObjectURL(audioDataSrc); //file blob
    audio.addEventListener("canplaythrough", loadCallbackOk, false);
    audio.addEventListener("load", loadCallbackOk, false);
    audio.addEventListener("error", loadCallbackError, false);
    audio.load();
  }

  function storeImageData(identifier, imageDataBlob) {
    let imageElement = new Image();
    imageElement.onload = function () {
      resourceStore.resources[identifier] = imageElement;
      decrease_resources_counter();

      window.URL.revokeObjectURL(imageElement.src); // Clean up after yourself.
    };
    imageElement.src = window.URL.createObjectURL(imageDataBlob);
  }

  function loadImage(identifier) {
    Assert.assert(
      identifier,
      "resourceStore#loadImage error: image not defined",
    );
    try {
      let request = new XMLHttpRequest();
      request.onloadend = function () {
        storeImageData(identifier, request.response);
      };
      request.open("GET", identifier, true);
      request.responseType = "blob";
      request.send();
    } catch (err) {
      throw (
        "resourceStore#loadImage error trying to load image " +
        identifier +
        "\n Details: \n " +
        err
      );
    }
  }

  function loadAudio(identifier) {
    Assert.assert(
      identifier,
      "resourceStore#loadAudio error: image not defined",
    );
    storeAudioData(identifier, identifier);
  }

  //load JSON file as an object
  function loadJSON(identifier) {
    //Assert.assert(identifier, "resourceStore#loadJSON error: json file not defined");
    try {
      let request = new XMLHttpRequest();
      request.onloadend = () => {
        let jsonDescriptor = request.responseText;
        if (EArray.last(identifier.split("/")) === "effects_descriptor.json")
          this.createEffectsFromDescriptor(JSON.parse(jsonDescriptor));
        else resourceStore.resources[identifier] = JSON.parse(jsonDescriptor);

        decrease_resources_counter();
      };
      request.open("GET", identifier, true);
      request.responseType = "text";
      request.send();
    } catch (err) {
      throw (
        "resourceStore#loadJSON error trying to read JSON file " +
        identifier +
        "\n Details: \n " +
        err
      );
    }
  }

  this.addResource = function (identifier) {
    if (this.resources[identifier]) return; //already loaded resource

    resources_loading++;

    Assert.assert(
      isSupportedResource(identifier),
      "resourceStore: resource type not recognized",
    );

    let loadFunc = isImage(identifier)
      ? loadImage
      : isAudio(identifier)
      ? loadAudio
      : loadJSON;
    loadFunc(identifier);

    return this;
  };

  //saves objects created by the system itself (like modified images or audio)
  this.addLocalResource = function (identifier, object) {
    this.resources[identifier] = object;
    return this;
  };

  //internal helper function to create unique new random names for images
  //newly created image start with "temp_". This serves to remove them once the game has finished
  //Note: adding "jpg" suffix just to qualify it as an image.
  this.createNewImageName = function (permanent = false) {
    let newName;

    do {
      newName = `${permanent ? "" : "temp_"}image_${Random.randomInt(
        100000000,
      ).toString()}.jpg`;
    } while (this.resources[newName]);

    return newName;
  };

  this.removeResourceIfTemporary = function (resourceName) {
    if (resourceName.includes("temp_")) this.removeResource(resourceName);
  };

  this.removeTemporaryResources = function () {
    Object.keys(this.resources).forEach((resource) => {
      if (resource.includes("temp_")) this.removeResource(resource);
    });
  };

  // //create canvas for image  manipulation
  // function ImageUtil.createCanvas(width, height) {
  //   let canvas = document.createElement('canvas')
  //   canvas.width = width
  //   canvas.height = height
  //   return canvas
  // }

  this.createNewImage = function (width, height, permanent = false) {
    let newImageName = this.createNewImageName(permanent);
    this.addLocalResource(newImageName, ImageUtil.createCanvas(width, height));
    return newImageName;
  };

  this.cloneImage = function (imageName) {
    let originalImage = this.retrieveResourceObject(imageName);
    let newCanvas = ImageUtil.createCanvas(
      originalImage.width,
      originalImage.height,
    );
    newCanvas.getContext("2d").drawImage(originalImage, 0, 0);
    let newImageName = this.createNewImageName(permanent);
    this.addLocalResource(newImageName, newCanvas);
    return newImageName;
  };

  this.getImageData = function (imageName) {
    let canvas = this.retrieveResourceObject(imageName);
    return canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);
  };

  this.setImageData = function (imageName, imageData) {
    let canvas = this.retrieveResourceObject(imageName);
    canvas.getContext("2d").putImageData(imageData, 0, 0);
  };

  this.checkResourceObjectExists = function (identifier) {
    return !(this.resources[identifier] === undefined);
  };

  this.retrieveResourceObject = function (identifier) {
    if (!this.checkResourceObjectExists(identifier)) {
      //have not found found a way to detect images are loaded...
      console.log(
        "Resource Store error: trying to retrieve unknown resource: " +
          identifier,
      );

      if (isImage(identifier)) {
        //returning blank canvas while image finish loading... :(
        return ImageUtil.createCanvas(10, 10);
      } else {
        return new Audio();
      }
    }

    return this.resources[identifier];
  };

  this.removeResource = function (identifier) {
    delete this.resources[identifier];
    return this;
  };

  this.hasResource = function (resourceToCheck) {
    return (
      this.resources.hasOwnProperty(resourceToCheck) &&
      this.resources[resourceToCheck]
    );
  };

  function retrieveAllResourceNamesBySuffix(suffix) {
    let mimeType = getMimeType(suffix);
    let result = [];
    Object.keys(resourceStore.resources).forEach((identifier) => {
      if (getMimeType(identifier) === mimeType) result.push(identifier);
    });
    return result;
  }

  this.retrieveAllAudioNames = function () {
    let result = [];
    SUPPORTED_AUDIO_SUFFIXES.map((suffix) => {
      result = result.concat(retrieveAllResourceNamesBySuffix(suffix));
    });
    return result;
  };
}

let resourceStore = new ResourceStore();

export { resourceStore };
