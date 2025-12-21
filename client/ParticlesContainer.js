'use strict';

import { Assert, EFunction } from 'arslib';

import { Random, Time, Util } from 'arslib';

import { vect } from '../common/geometry/Vector.js';

import { CoordinatesConversion } from './CoordinatesConversion.js';

/**
 * @fileoverview Particle system for creating and managing visual effects.
 * Handles particle creation, animation, rendering, and emitter systems.
 */

/**
 * ParticlesContainer constructor - Manages particle systems and emitters.
 * Provides functionality for creating particles, particle emitters, and handling their lifecycle.
 * @constructor
 */
function ParticlesContainer() {
  let camera;
  let resourceStore;
  let screen;

  /**
   * @memberof ParticlesContainer
   * @type {number}
   * @description Default radius for particles in pixels.
   */
  this.DEFAULT_RADIUS = 10;

  /**
   * @memberof ParticlesContainer
   * @type {number}
   * @description Default radius for circular emitters in pixels.
   */
  this.CIRCULAR_EMITTER_DEFAULT_RADIUS = this.DEFAULT_RADIUS * 5;

  /**
   * @memberof ParticlesContainer
   * @type {number}
   * @description Default time to live for particles in milliseconds.
   */
  this.DEFAULT_PARTICLE_TIME_TO_LIVE = 1000;

  let colorToParticleImage;

  /**
   * @memberof ParticlesContainer
   * @type {number}
   * @description Default time to live for emitters in milliseconds.
   */
  this.DEFAULT_EMITTER_TIME_TO_LIVE = 1000;

  /**
   * @memberof ParticlesContainer
   * @type {number}
   * @description Default latency between particle releases in milliseconds.
   */
  this.DEFAULT_PARTICLE_RELEASE_LATENCY = 100;

  let particles;
  let emitters;

  /**
   * Initializes the particle container with camera reference and resources.
   * @memberof ParticlesContainer
   * @param {Object} cameraInput - Camera object for coordinate conversions.
   * @param {ResourceStore} resourceStoreInput - Resource store instance.
   * @param {Screen} screenInput - Screen instance for canvas context access.
   */
  this.start = function (cameraInput, resourceStoreInput, screenInput) {
    camera = cameraInput;
    resourceStore = resourceStoreInput;
    screen = screenInput;
    particles = {};
    emitters = [];
    colorToParticleImage = {
      red: resourceStore.retrieveResourceObject('redParticle.jpg'),
      green: resourceStore.retrieveResourceObject('greenParticle.jpg'),
      blue: resourceStore.retrieveResourceObject('blueParticle.jpg'),
    };
  };

  /**
   * Generates a unique random ID for particles.
   * @returns {number} Random particle ID.
   */
  function createParticleId() {
    return Random.randomInt(10000000);
  }

  /**
   * Creates a single particle with specified properties.
   * @memberof ParticlesContainer
   * @param {Object} options - Particle configuration options.
   * @param {number} options.positionX - Initial X position.
   * @param {number} options.positionY - Initial Y position.
   * @param {number} options.speedX - Horizontal velocity.
   * @param {number} options.speedY - Vertical velocity.
   * @param {boolean} options.screenParticle - True if position is screen-relative, false for world-relative.
   * @param {number} [options.colorRed=255] - Red color component (0-255).
   * @param {number} [options.colorGreen=255] - Green color component (0-255).
   * @param {number} [options.colorBlue=255] - Blue color component (0-255).
   * @param {number} [options.timeToLive] - Particle lifetime in milliseconds.
   * @param {number} [options.radius] - Particle radius in pixels.
   * @param {number} [options.occurrenceProbability=1] - Probability of particle creation (0-1) or count if >1.
   */
  this.createParticle = function ({
    positionX,
    positionY,
    speedX,
    speedY,
    screenParticle,
    colorRed,
    colorGreen,
    colorBlue,
    timeToLive,
    radius,
    occurrenceProbability,
  }) {
    //set defaults
    colorRed = typeof colorRed === 'number' ? colorRed : 255;
    colorGreen = typeof colorGreen === 'number' ? colorGreen : 255;
    colorBlue = typeof colorBlue === 'number' ? colorBlue : 255;

    (timeToLive = timeToLive || this.DEFAULT_PARTICLE_TIME_TO_LIVE),
    (radius = radius || this.DEFAULT_RADIUS),
    (occurrenceProbability =
        typeof occurrenceProbability === 'number' ? occurrenceProbability : 1);

    if (!Random.occurrenceProbability(occurrenceProbability)) return;

    Assert.assertValueIsInsideLimits(colorRed, 0, 255);
    Assert.assertValueIsInsideLimits(colorGreen, 0, 255);
    Assert.assertValueIsInsideLimits(colorBlue, 0, 255);

    // *** ADJUSTED SPEED NOT WORKING ***
    // let adjustedParticleSpeed =
    //     screenParticle?
    //       vect(speedX, speedY) :
    //       CoordinatesConversion.worldToCanvas(
    //         vect(speedX, speedY), camera.rectangle, screen.getSize())
    let adjustedParticleSpeed = vect(speedX, speedY);

    // if occurrenceProbability is greater than 1 draw occurrenceProbability particles
    for (
      let particleCount = 0;
      particleCount < occurrenceProbability;
      particleCount++
    ) {
      let particle = {
        positionX,
        positionY,
        speedX: adjustedParticleSpeed.x,
        speedY: adjustedParticleSpeed.y,
        screenParticle,
        color: { red: colorRed, green: colorGreen, blue: colorBlue },
        radius,
        timeToLive,
        creationTime: Time.currentTime(),
        opacity: 1,
      };
      particles[createParticleId()] = particle;
    }
  };

  /**
   * Creates a particle with random variations for spray effects.
   * @memberof ParticlesContainer
   * @param {number} positionX - Initial X position.
   * @param {number} positionY - Initial Y position.
   * @param {number} speedX - Base horizontal velocity.
   * @param {number} speedY - Base vertical velocity.
   * @param {boolean} [screenParticle=true] - True if position is screen-relative.
   * @param {number} [colorRed=255] - Base red color component (0-255).
   * @param {number} [colorGreen=255] - Base green color component (0-255).
   * @param {number} [colorBlue=255] - Base blue color component (0-255).
   * @param {number} [timeToLive] - Base particle lifetime in milliseconds.
   * @param {number} [radius] - Particle radius in pixels.
   * @param {number} [occurrenceProbability=1] - Probability of particle creation.
   * @param {number} [speedVariation=1] - Amount of speed randomization.
   * @param {number} [timeToLiveVariation] - Amount of lifetime randomization.
   * @param {number} [colorVariation=2] - Amount of color randomization.
   */
  this.createParticleInSpray = function (
    positionX,
    positionY,
    speedX,
    speedY,
    screenParticle = true,
    colorRed = 255,
    colorGreen = 255,
    colorBlue = 255,
    timeToLive = this.DEFAULT_PARTICLE_TIME_TO_LIVE,
    radius = this.DEFAULT_RADIUS,
    occurrenceProbability = 1,
    speedVariation = 1,
    timeToLiveVariation = this.DEFAULT_PARTICLE_TIME_TO_LIVE / 20,
    colorVariation = 2,
  ) {
    speedX += Random.randomFromInterval(-speedVariation, speedVariation);
    speedY += Random.randomFromInterval(-speedVariation, speedVariation);
    timeToLive += Random.randomFromInterval(
      -timeToLiveVariation,
      timeToLiveVariation,
    );

    colorRed += Random.randomFromInterval(-colorVariation, colorVariation);
    colorRed = Util.limitValueToMinMax(colorRed, 0, 255);
    colorGreen += Random.randomFromInterval(-colorVariation, colorVariation);
    colorGreen = Util.limitValueToMinMax(colorGreen, 0, 255);
    colorBlue += Random.randomFromInterval(-colorVariation, colorVariation);
    colorBlue = Util.limitValueToMinMax(colorBlue, 0, 255);

    this.createParticle({
      positionX,
      positionY,
      speedX,
      speedY,
      screenParticle,
      colorRed,
      colorGreen,
      colorBlue,
      timeToLive,
      radius,
      occurrenceProbability,
    });
  };

  /**
   * Updates particle positions, lifetimes, and removes expired particles.
   */
  function runParticles() {
    for (let id in particles) {
      let particle = particles[id];
      particle.positionX += particle.speedX;
      particle.positionY -= particle.speedY; //canvas inverted y

      let timeAlive = Time.currentTime() - particle.creationTime;
      let remainingTimeToLive = particle.timeToLive - timeAlive;
      if (particle.timeToLive <= timeAlive)
        delete particles[id]; //remove transparent particle
      else particle.opacity = remainingTimeToLive / particle.timeToLive;
    }
  }

  /**
   * Converts color intensity (0-255) to opacity (0-1).
   * @param {number} colorIntensity - Color intensity value (0-255).
   * @returns {number} Opacity value (0-1).
   */
  function fromColorToOpacity(colorIntensity) {
    //255            -> 1
    //colorIntensity -> x
    return colorIntensity / 255;
  }

  /**
   * Draws individual color components of a particle.
   * @param {Object} particle - The particle to draw.
   * @param {CanvasRenderingContext2D} context - Canvas rendering context.
   */
  function drawParticleComponents(particle, context) {
    //particle.screenParticle
    let adjustedParticlePosition = particle.screenParticle
      ? vect(particle.positionX, particle.positionY)
      : CoordinatesConversion.worldToCanvas(
        vect(particle.positionX, particle.positionY),
        camera.rectangle,
        screen.getSize(),
      );

    for (let colorComponent in colorToParticleImage) {
      context.globalAlpha =
        fromColorToOpacity(particle.color[colorComponent]) * particle.opacity;

      if (context.globalAlpha === 0) continue; //improve performance
      context.drawImage(
        colorToParticleImage[colorComponent],
        adjustedParticlePosition.x - particle.radius / screen.zoomOutFactor,
        adjustedParticlePosition.y - particle.radius / screen.zoomOutFactor,
        (particle.radius * 2) / screen.zoomOutFactor,
        (particle.radius * 2) / screen.zoomOutFactor,
      );
    }
  }

  /**
   * Renders all active particles to the screen.
   */
  function drawParticles() {
    let context = screen.getContext();
    for (let id in particles) {
      let particle = particles[id];
      context.save();
      context.globalCompositeOperation = 'lighter';
      drawParticleComponents(particle, context);
      context.restore();
    }
  }

  /**
   * Creates a circular particle emitter that releases particles in a circular pattern.
   * The emitter can have an owner agent. Multiple creations with the same owner reset the time to live.
   * @memberof ParticlesContainer
   * @param {number} positionX - Initial X position of emitter.
   * @param {number} positionY - Initial Y position of emitter.
   * @param {number} speedX - Emitter horizontal velocity.
   * @param {number} speedY - Emitter vertical velocity.
   * @param {boolean} [screenEmitterInput=true] - True if position is screen-relative.
   * @param {*} [ownerAgentIdInput] - ID of owning agent (for emitter renewal).
   * @param {number} [colorRed=255] - Red color component (0-255).
   * @param {number} [colorGreen=255] - Green color component (0-255).
   * @param {number} [colorBlue=255] - Blue color component (0-255).
   * @param {number} [particleReleaseLatency] - Time between particle releases in ms.
   * @param {number} [timeToLive] - Emitter lifetime in milliseconds.
   * @param {number} [radius] - Emitter radius for particle placement.
   */
  this.createCircularEmitter = function (
    positionX,
    positionY,
    speedX,
    speedY,
    screenEmitterInput = true,
    ownerAgentIdInput,
    colorRed = 255,
    colorGreen = 255,
    colorBlue = 255,
    particleReleaseLatency = this.DEFAULT_PARTICLE_RELEASE_LATENCY,
    timeToLive = this.DEFAULT_EMITTER_TIME_TO_LIVE,
    radius = this.CIRCULAR_EMITTER_DEFAULT_RADIUS,
  ) {
    Assert.assertValueIsInsideLimits(colorRed, 0, 255);
    Assert.assertValueIsInsideLimits(colorGreen, 0, 255);
    Assert.assertValueIsInsideLimits(colorBlue, 0, 255);

    //check if is owned by an agent. If so renew emitter
    if (ownerAgentIdInput) {
      let ownedEmitter = emitters.find(
        (emitter) => emitter.ownerAgentId === ownerAgentIdInput,
      );
      if (ownedEmitter) {
        ownedEmitter.creationTime = Time.currentTime();
        return;
      }
    }

    let emitter = {
      positionX: positionX,
      positionY: positionY,
      speedX: speedX,
      speedY: speedY,
      ownerAgentId: ownerAgentIdInput,
      screenEmitter: screenEmitterInput,
      color: { red: colorRed, green: colorGreen, blue: colorBlue },
      radius: radius,
      timeToLive: timeToLive,
      creationTime: Time.currentTime(),
    };

    let angle = Random.randomFromInterval(0, 2 * Math.PI);
    let runWithoutRateLimit = () => {
      this.createParticle({
        positionX: positionX + Math.cos(angle) * radius,
        positionY: positionY + Math.sin(angle) * radius,
        speedX: 0,
        speedY: 0,
        screenParticle: screenEmitterInput,
        colorRed,
        colorGreen,
        colorBlue,
        timeToLive: timeToLive,
        radius: radius / 5,
        occurrenceProbability: 1,
      });
      angle += 0.5;
    };

    emitter.run = EFunction.limitCallingRateWithDiscard(
      runWithoutRateLimit,
      particleReleaseLatency,
    );

    emitters.push(emitter);
  };

  /**
   * Creates a spray particle emitter that releases particles in random directions.
   * @memberof ParticlesContainer
   * @param {number} positionX - Initial X position of emitter.
   * @param {number} positionY - Initial Y position of emitter.
   * @param {number} speedX - Emitter horizontal velocity.
   * @param {number} speedY - Emitter vertical velocity.
   * @param {boolean} [screenEmitterInput=true] - True if position is screen-relative.
   * @param {number} [colorRed=255] - Red color component (0-255).
   * @param {number} [colorGreen=255] - Green color component (0-255).
   * @param {number} [colorBlue=255] - Blue color component (0-255).
   * @param {number} [particleReleaseLatency] - Time between particle releases in ms.
   * @param {number} [timeToLive] - Emitter lifetime in milliseconds.
   * @param {number} [radius] - Emitter radius for particle placement.
   */
  this.createSprayEmitter = function (
    positionX,
    positionY,
    speedX,
    speedY,
    screenEmitterInput = true,
    colorRed = 255,
    colorGreen = 255,
    colorBlue = 255,
    particleReleaseLatency = this.DEFAULT_PARTICLE_RELEASE_LATENCY,
    timeToLive = this.DEFAULT_EMITTER_TIME_TO_LIVE,
    radius = this.CIRCULAR_EMITTER_DEFAULT_RADIUS,
  ) {
    Assert.assertValueIsInsideLimits(colorRed, 0, 255);
    Assert.assertValueIsInsideLimits(colorGreen, 0, 255);
    Assert.assertValueIsInsideLimits(colorBlue, 0, 255);

    let emitter = {
      positionX: positionX,
      positionY: positionY,
      speedX: speedX,
      speedY: speedY,
      screenEmitter: screenEmitterInput,
      color: { red: colorRed, green: colorGreen, blue: colorBlue },
      radius: radius,
      timeToLive: timeToLive,
      creationTime: Time.currentTime(),
    };

    let runWithoutRateLimit = () => {
      this.createParticleInSpray(
        positionX,
        positionY,
        speedX,
        speedY,
        screenEmitterInput,
      );
    };

    emitter.run = EFunction.limitCallingRateWithDiscard(
      runWithoutRateLimit,
      particleReleaseLatency,
    );

    emitters.push(emitter);
  };

  /**
   * Removes emitters that have exceeded their time to live.
   */
  function removeDeadEmitters() {
    emitters = emitters.filter((emitter) => {
      if (!emitter.timeToLive) return true; //never dies
      return Time.currentTime() - emitter.creationTime < emitter.timeToLive;
    });
  }

  /**
   * Updates all active emitters, running their particle generation and movement.
   */
  function runEmitters() {
    emitters.forEach(function (emitter) {
      emitter.run();
      emitter.positionX += emitter.speedX;
      emitter.positionY -= emitter.speedY; //canvas inverted y
    });
  }

  /**
   * Main animation step that updates and renders all particles and emitters.
   * Should be called once per frame.
   * @memberof ParticlesContainer
   */
  this.animationStep = function () {
    if (particles.length === 0 && emitters.length === 0) return;
    runEmitters();
    removeDeadEmitters();
    runParticles();
    drawParticles();
  };
}

export { ParticlesContainer };
