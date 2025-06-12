/**
 * @fileoverview Resource management system for loading and storing game assets.
 * Handles images, audio, JSON files, and provides resource lifecycle management.
 *
 * Usage:
 * Add resources with resourceStore.addResource and call resourceStore.callWhenReady
 * with a callback to be invoked when resource store has finished loading resources.
 */

"use strict";

import { Assert, EArray, Random } from "arslib";

import { ImageUtil } from "arslib";

import { Effect } from "./image/effect/Effect.js";

/**
 * ResourceStore constructor - Manages loading, storing, and retrieving game resources.
 * Supports images (png, jpg, svg), audio (mp3), and JSON files.
 * @constructor
 */
function ResourceStore() {
  //resource types
  /**
   * @type {string[]}
   * @description Supported audio file extensions.
   */
  let SUPPORTED_AUDIO_SUFFIXES = ["mp3"];

  /**
   * @type {string[]}
   * @description Supported image file extensions.
   */
  let SUPPORTED_IMAGE_SUFFIXES = ["png", "jpg", "svg"];

  let effectsDescriptor;

  /**
   * Extracts the file extension from a resource identifier.
   * @param {string} identifier - Resource identifier/filename.
   * @returns {string} File extension.
   */
  function getIdentifierSuffix(identifier) {
    return EArray.last(identifier.split("."));
  }

  /**
   * Gets the MIME type for a resource based on its file extension.
   * @param {string} identifier - Resource identifier/filename.
   * @returns {string} MIME type string.
   * @throws {Error} If suffix is not supported.
   */
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

  /**
   * @memberof ResourceStore
   * @type {Object}
   * @description Storage object for all loaded resources.
   */
  this.resources = {};

  /**
   * @type {number}
   * @description Counter for resources currently being loaded.
   */
  let resources_loading = 0;

  /**
   * Checks if all resources have finished loading.
   * @memberof ResourceStore
   * @returns {boolean} True if all resources are loaded.
   */
  this.isReady = function () {
    return resources_loading <= 0;
  };

  /**
   * @memberof ResourceStore
   * @type {Function|null}
   * @description Callback to execute after all resources load.
   */
  this.executeAfterLoad = null;

  /**
   * Creates visual effects from a descriptor object.
   * @memberof ResourceStore
   * @param {Object} descriptorObj - Effects descriptor with images array.
   * @param {Array} descriptorObj.images - Array of image effect definitions.
   */
  this.createEffectsFromDescriptor = function (descriptorObj) {
    descriptorObj.images.forEach((newImage) => {
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
          this,
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

  /**
   * Executes a callback when all resources are loaded.
   * @memberof ResourceStore
   * @param {Function} functionToCall - Callback to execute when ready.
   */
  this.callWhenReady = function (functionToCall) {
    if (resources_loading === 0) {
      if (effectsDescriptor)
        this.createEffectsFromDescriptor(JSON.parse(effectsDescriptor));
      functionToCall();
      return;
    }

    // Not ready yet... Try again in a while
    setTimeout(() => {
      this.callWhenReady(functionToCall);
    }, 100);
  };

  /**
   * Decrements the loading counter when a resource finishes loading.
   */
  function decrease_resources_counter() {
    Assert.assert(
      resources_loading > 0,
      "Error in resource loading counting in Resource Store...",
    );
    resources_loading--;
  }

  /**
   * Clears all stored resources.
   * @memberof ResourceStore
   */
  this.clearAll = function () {
    this.resources = {};
  };

  /**
   * Clears all resources except those specified in the preserve array.
   * @memberof ResourceStore
   * @param {string[]} resourcesToPreserveArray - Array of resource names to keep.
   */
  this.clearAllBut = function (resourcesToPreserveArray) {
    Object.keys(this.resources).forEach((resource) => {
      if (!resourcesToPreserveArray.includes(resource))
        this.removeResource(resource);
    });
  };

  /**
   * Checks if a resource identifier matches any of the given file extensions.
   * @param {string} identifier - Resource identifier/filename.
   * @param {string[]} fileExtensionsArray - Array of file extensions to check.
   * @returns {boolean} True if identifier matches any extension.
   */
  function isType(identifier, fileExtensionsArray) {
    for (let i = 0; i < fileExtensionsArray.length; i++) {
      if (identifier.indexOf(fileExtensionsArray[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a resource is an audio file.
   * @param {string} identifier - Resource identifier/filename.
   * @returns {boolean} True if resource is audio.
   */
  function isAudio(identifier) {
    return isType(identifier, SUPPORTED_AUDIO_SUFFIXES);
  }

  /**
   * Checks if a resource is an image file.
   * @param {string} identifier - Resource identifier/filename.
   * @returns {boolean} True if resource is an image.
   */
  function isImage(identifier) {
    return isType(identifier, SUPPORTED_IMAGE_SUFFIXES);
  }

  /**
   * Checks if a resource is a JSON file.
   * @param {string} identifier - Resource identifier/filename.
   * @returns {boolean} True if resource is JSON.
   */
  function isJSONFile(identifier) {
    return isType(identifier, [".json"]);
  }

  /**
   * Checks if a resource type is supported by the store.
   * @param {string} identifier - Resource identifier/filename.
   * @returns {boolean} True if resource type is supported.
   */
  function isSupportedResource(identifier) {
    return isAudio(identifier) || isImage(identifier) || isJSONFile(identifier);
  }

  /**
   * Stores audio data and sets up loading callbacks.
   * @param {string} identifier - Audio resource identifier.
   * @param {string|Blob} audioDataSrc - Audio source (path or blob).
   */
  const storeAudioData = (identifier, audioDataSrc) => {
    let audio = new Audio();

    const loadCallbackOk = (evt) => {
      audio.removeEventListener("canplaythrough", loadCallbackOk, false);
      audio.removeEventListener("load", loadCallbackOk, false);
      this.resources[identifier] = audio;
      decrease_resources_counter();
    };

    const loadCallbackError = (evt) => {
      audio.removeEventListener("error", loadCallbackError, false);
      throw "Audio loading Error: " + identifier;
    };
    audio.src =
      typeof audioDataSrc === "string"
        ? audioDataSrc //file path
        : window.URL.createObjectURL(audioDataSrc); //file blob
    audio.addEventListener("canplaythrough", loadCallbackOk, false);
    audio.addEventListener("load", loadCallbackOk, false);
    audio.addEventListener("error", loadCallbackError, false);
    audio.load();
  };

  /**
   * Stores image data from a blob and sets up loading callback.
   * @param {string} identifier - Image resource identifier.
   * @param {Blob} imageDataBlob - Image data blob.
   */
  const storeImageData = (identifier, imageDataBlob) => {
    let imageElement = new Image();
    imageElement.onload = () => {
      this.resources[identifier] = imageElement;
      decrease_resources_counter();
      window.URL.revokeObjectURL(imageElement.src); // Clean up after yourself.
    };
    imageElement.src = window.URL.createObjectURL(imageDataBlob);
  };

  /**
   * Loads an image resource via XMLHttpRequest.
   * @param {string} identifier - Image resource identifier.
   */
  const loadImage = (identifier) => {
    Assert.assert(
      identifier,
      "resourceStore#loadImage error: image not defined",
    );
    try {
      let request = new XMLHttpRequest();
      request.onloadend = () => {
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
  };

  /**
   * Loads an audio resource.
   * @param {string} identifier - Audio resource identifier.
   */
  const loadAudio = (identifier) => {
    Assert.assert(
      identifier,
      "resourceStore#loadAudio error: image not defined",
    );
    storeAudioData(identifier, identifier);
  };

  /**
   * Loads a JSON file as an object.
   * @param {string} identifier - JSON resource identifier.
   */
  const loadJSON = (identifier) => {
    //Assert.assert(identifier, "resourceStore#loadJSON error: json file not defined");
    try {
      let request = new XMLHttpRequest();
      request.onloadend = () => {
        let jsonDescriptor = request.responseText;
        if (EArray.last(identifier.split("/")) === "effects_descriptor.json")
          this.createEffectsFromDescriptor(JSON.parse(jsonDescriptor));
        else this.resources[identifier] = JSON.parse(jsonDescriptor);

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
  };

  /**
   * Adds a resource to the loading queue.
   * @memberof ResourceStore
   * @param {string} identifier - Resource identifier/path.
   * @returns {ResourceStore} This instance for chaining.
   */
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

  /**
   * Saves objects created by the system itself (like modified images or audio).
   * @memberof ResourceStore
   * @param {string} identifier - Resource identifier.
   * @param {*} object - Resource object to store.
   * @returns {ResourceStore} This instance for chaining.
   */
  this.addLocalResource = function (identifier, object) {
    this.resources[identifier] = object;
    return this;
  };

  /**
   * Creates a unique random name for new images.
   * Temporary images start with "temp_" prefix for later cleanup.
   * @memberof ResourceStore
   * @param {boolean} [permanent=false] - Whether the image should be permanent.
   * @returns {string} Unique image name with .jpg suffix.
   */
  this.createNewImageName = function (permanent = false) {
    let newName;

    do {
      newName = `${permanent ? "" : "temp_"}image_${Random.randomInt(
        100000000,
      ).toString()}.jpg`;
    } while (this.resources[newName]);

    return newName;
  };

  /**
   * Removes a resource if it's marked as temporary.
   * @memberof ResourceStore
   * @param {string} resourceName - Name of resource to check and potentially remove.
   */
  this.removeResourceIfTemporary = function (resourceName) {
    if (resourceName.includes("temp_")) this.removeResource(resourceName);
  };

  /**
   * Removes all temporary resources (those with "temp_" prefix).
   * @memberof ResourceStore
   */
  this.removeTemporaryResources = function () {
    Object.keys(this.resources).forEach((resource) => {
      if (resource.includes("temp_")) this.removeResource(resource);
    });
  };

  /**
   * Creates a new canvas image with specified dimensions.
   * @memberof ResourceStore
   * @param {number} width - Canvas width in pixels.
   * @param {number} height - Canvas height in pixels.
   * @param {boolean} [permanent=false] - Whether the image should be permanent.
   * @returns {string} Name of the created image resource.
   */
  this.createNewImage = function (width, height, permanent = false) {
    let newImageName = this.createNewImageName(permanent);
    this.addLocalResource(newImageName, ImageUtil.createCanvas(width, height));
    return newImageName;
  };

  /**
   * Creates a copy of an existing image resource.
   * @memberof ResourceStore
   * @param {string} imageName - Name of the image to clone.
   * @returns {string} Name of the cloned image resource.
   */
  this.cloneImage = function (imageName) {
    let originalImage = this.retrieveResourceObject(imageName);
    let newCanvas = ImageUtil.createCanvas(
      originalImage.width,
      originalImage.height,
    );
    newCanvas.getContext("2d").drawImage(originalImage, 0, 0);
    let newImageName = this.createNewImageName(false); // cloned images are temporary by default
    this.addLocalResource(newImageName, newCanvas);
    return newImageName;
  };

  /**
   * Gets image data for manipulation from a stored image.
   * @memberof ResourceStore
   * @param {string} imageName - Name of the image resource.
   * @returns {ImageData} Canvas ImageData object.
   */
  this.getImageData = function (imageName) {
    let canvas = this.retrieveResourceObject(imageName);
    return canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);
  };

  /**
   * Sets image data for a stored image resource.
   * @memberof ResourceStore
   * @param {string} imageName - Name of the image resource.
   * @param {ImageData} imageData - ImageData to set.
   */
  this.setImageData = function (imageName, imageData) {
    let canvas = this.retrieveResourceObject(imageName);
    canvas.getContext("2d").putImageData(imageData, 0, 0);
  };

  /**
   * Checks if a resource exists in storage.
   * @memberof ResourceStore
   * @param {string} identifier - Resource identifier to check.
   * @returns {boolean} True if resource exists.
   */
  this.checkResourceObjectExists = function (identifier) {
    return !(this.resources[identifier] === undefined);
  };

  /**
   * Retrieves a stored resource object.
   * @memberof ResourceStore
   * @param {string} identifier - Resource identifier.
   * @returns {*} The stored resource object, or fallback object if not found.
   */
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

  /**
   * Removes a resource from storage.
   * @memberof ResourceStore
   * @param {string} identifier - Resource identifier to remove.
   * @returns {ResourceStore} This instance for chaining.
   */
  this.removeResource = function (identifier) {
    delete this.resources[identifier];
    return this;
  };

  /**
   * Checks if a specific resource exists and is loaded.
   * @memberof ResourceStore
   * @param {string} resourceToCheck - Resource identifier to check.
   * @returns {boolean} True if resource exists and is loaded.
   */
  this.hasResource = function (resourceToCheck) {
    return (
      this.resources.hasOwnProperty(resourceToCheck) &&
      this.resources[resourceToCheck]
    );
  };

  /**
   * Retrieves all resource names with a specific file suffix.
   * @param {string} suffix - File suffix to filter by.
   * @returns {string[]} Array of matching resource names.
   */
  const retrieveAllResourceNamesBySuffix = (suffix) => {
    let mimeType = getMimeType(suffix);
    let result = [];
    Object.keys(this.resources).forEach((identifier) => {
      if (getMimeType(identifier) === mimeType) result.push(identifier);
    });
    return result;
  };

  /**
   * Gets all loaded audio resource names.
   * @memberof ResourceStore
   * @returns {string[]} Array of audio resource names.
   */
  this.retrieveAllAudioNames = function () {
    let result = [];
    SUPPORTED_AUDIO_SUFFIXES.map((suffix) => {
      result = result.concat(retrieveAllResourceNamesBySuffix(suffix));
    });
    return result;
  };
}

export { ResourceStore };
