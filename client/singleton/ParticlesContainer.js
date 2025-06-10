"use strict";

import { Assert, EFunction } from "arslib";

import { Random, Time, Util } from "arslib";

import { vect } from "../../common/geometry/Vector.js";

import { CoordinatesConversion } from "../CoordinatesConversion.js";
import { resourceStore } from "./ResourceStore.js";
import { screen } from "./Screen.js";

function ParticlesContainer() {
  let camera;

  this.DEFAULT_RADIUS = 10;
  this.CIRCULAR_EMITTER_DEFAULT_RADIUS = this.DEFAULT_RADIUS * 5;
  this.DEFAULT_PARTICLE_TIME_TO_LIVE = 1000;

  let particleImage;
  let colorToParticleImage;

  this.DEFAULT_EMITTER_TIME_TO_LIVE = 1000;
  this.DEFAULT_PARTICLE_RELEASE_LATENCY = 100;
  let particles;
  let emitters;

  //needs to be initialized before use
  this.start = function (cameraInput) {
    camera = cameraInput;
    particles = {};
    emitters = [];
    particleImage = resourceStore.retrieveResourceObject("whiteParticle.jpg");
    colorToParticleImage = {
      red: resourceStore.retrieveResourceObject("redParticle.jpg"),
      green: resourceStore.retrieveResourceObject("greenParticle.jpg"),
      blue: resourceStore.retrieveResourceObject("blueParticle.jpg"),
    };
  };

  function createParticleId() {
    return Random.randomInt(10000000);
  }
  //NOte2: the particle position and speed (x,-y) are relative to canvas size
  //Note3: screenParticle defines (true) if a particle position is on the screen or
  //       (false) on the world.
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
    colorRed = typeof colorRed === "number" ? colorRed : 255;
    colorGreen = typeof colorGreen === "number" ? colorGreen : 255;
    colorBlue = typeof colorBlue === "number" ? colorBlue : 255;

    (timeToLive = timeToLive || this.DEFAULT_PARTICLE_TIME_TO_LIVE),
      (radius = radius || this.DEFAULT_RADIUS),
      (occurrenceProbability =
        typeof occurrenceProbability === "number" ? occurrenceProbability : 1);

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

  //add a little variation
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

  function fromColorToOpacity(colorIntensity) {
    //255            -> 1
    //colorIntensity -> x
    return colorIntensity / 255;
  }

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

  function drawParticles() {
    let context = screen.getContext();
    for (let id in particles) {
      let particle = particles[id];
      context.save();
      context.globalCompositeOperation = "lighter";
      drawParticleComponents(particle, context);
      context.restore();
    }
  }

  // Just moves according to speed and releases particles along the way
  // The emitter can have an onwer. In this case, if it is created multiple times with the same
  // owner, the effect is that every creation resets its time to live.
  // This is needed besause in the client we do not have knowledge of creation and death of the agents.
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
      particlesContainer.createParticle({
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

  // Just moves according to speed and releases particles along the way
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
      particlesContainer.createParticleInSpray(
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

  function removeDeadEmitters() {
    emitters = emitters.filter((emitter) => {
      if (!emitter.timeToLive) return true; //never dies
      return Time.currentTime() - emitter.creationTime < emitter.timeToLive;
    });
  }

  function runEmitters() {
    emitters.forEach(function (emitter) {
      emitter.run();
      emitter.positionX += emitter.speedX;
      emitter.positionY -= emitter.speedY; //canvas inverted y
    });
  }

  this.animationStep = function () {
    if (particles.length === 0 && emitters.length === 0) return;
    runEmitters();
    removeDeadEmitters();
    runParticles();
    drawParticles();
  };
}

let particlesContainer = new ParticlesContainer();

export { particlesContainer };
