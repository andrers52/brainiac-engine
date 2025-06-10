"use strict";

/**
 * @file Global agent configuration definitions for the Brainiac Engine.
 * Contains timing constants and execution intervals for agent behavior.
 * @module AgentDefinitions
 */

/**
 * Global configuration object for agent system settings.
 * All timing values are in milliseconds.
 * @namespace AgentDefinitions
 */
var AgentDefinitions = {};

/**
 * Execution interval for running agent behaviors.
 * Should match medium network delay for optimal performance.
 * @memberof AgentDefinitions
 * @type {number}
 * @default 80
 * @todo This should be equal to the medium network delay
 */
AgentDefinitions.AGENTS_EXECUTION_INTERVAL = 80; //65

/**
 * Refresh interval for client-side agent updates.
 * Controls the frame rate for agent rendering (roughly 12.5 FPS).
 * @memberof AgentDefinitions
 * @type {number}
 * @default 80
 */
AgentDefinitions.AGENTS_CLIENT_REFRESH_INTERVAL = 80; //70; //1000/20 (fps)

/**
 * Freeze the AgentDefinitions object to prevent modifications.
 * No more changes to definitions outside here.
 */
Object.freeze(AgentDefinitions);

export { AgentDefinitions };
