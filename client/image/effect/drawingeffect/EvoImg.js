"use strict";

import { Assert } from "arslib";

/**
 * Evolutionary image generator that draws shapes based on encoded instructions
 * Receives an array of primitives to draw and renders them to the canvas
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {Array<Array<number>>} code - Array of drawing instructions, each containing shape parameters
 */
export function EvoImg(context, code) {
  let fill = true;
  let lineWidth = 1;

  //index is code
  let drawingCodeToType = ["rectangle", "circle", "triangle"];
  let globalCompositeOperationCodeToType = [
    "source-over",
    "lighter",
    "copy",
    "xor",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
  ];

  /**
   * Executes a single drawing instruction
   * @param {Array<number>} instructionParameters - Array containing shape type, composite operation, position, size, color, orientation, and alpha values
   * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
   */
  function execInstruction(instructionParameters, context) {
    let positionX = instructionParameters[2];
    let positionY = instructionParameters[3];
    let sizeX = instructionParameters[4];
    let sizeY = instructionParameters[5];
    let colorR = instructionParameters[6];
    let colorG = instructionParameters[7];
    let colorB = instructionParameters[8];
    let orientation = instructionParameters[9];
    let alpha = instructionParameters[10];

    context.save();
    context.translate(positionX, positionY);
    context.rotate(-orientation);
    context.fillStyle =
      context.strokeStyle = `rgba(${colorR}, ${colorG}, ${colorB}, 1)`;
    context.globalAlpha = alpha;
    context.globalCompositeOperation =
      globalCompositeOperationCodeToType[instructionParameters[1]];
    context.lineWidth = lineWidth;
    let operation = drawingCodeToType[instructionParameters[0]];
    switch (operation) {
      case "rectangle":
        if (fill) {
          context.fillRect(
            positionX - sizeX / 2,
            positionY - sizeY / 2,
            sizeX,
            sizeY,
          );
        } else {
          context.rect(
            positionX - sizeX / 2,
            positionY - sizeY / 2,
            sizeX,
            sizeY,
          );
          context.stroke();
        }
        break;

      case "circle":
        context.beginPath();
        context.arc(
          positionX,
          positionY,
          (sizeX + sizeY) / 4, // radius,
          0,
          2 * Math.PI,
        );
        if (fill) context.fill();
        else context.stroke();
        break;

      case "triangle":
        context.beginPath();
        context.moveTo(positionX, positionY - sizeY / 2); // top
        context.lineTo(positionX - sizeX / 2, positionY + sizeY / 2); // bottom left
        context.lineTo(positionX + sizeX / 2, positionY + sizeY / 2); // bottom right
        if (fill) context.fill();
        else context.stroke();
        break;
      default:
        Assert.assert(false, "Instruction is flawed");
    }
    context.restore();
  }

  /**
   * Executes all drawing instructions in the code array
   * @param {Array<Array<number>>} code - Array of drawing instruction arrays
   * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
   */
  function execDrawingInstructions(code, context) {
    for (let i0 = 0; i0 < code.length; i0++) execInstruction(code[i0], context);
  }

  // TODO: ADD MIRROR EFFECTS
  return execDrawingInstructions(code, context);
}
