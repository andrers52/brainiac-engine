"use strict";

/**
 * @file User representation for connected clients in the Brainiac Engine.
 * Manages user sessions, their associated agents, cameras, and network connections.
 * @module User
 */

/** @type {number} Global user ID counter for unique user identification */
var userId = 0;

/**
 * Represents a connected user in the game system.
 * Each user has a unique ID, network socket, camera for viewing, and an agent for interaction.
 *
 * @param {Object} socket - The WebSocket connection for this user
 * @constructor
 * @class User
 *
 * @example
 * // Create a new user (typically done automatically on connection)
 * const user = new User(socketConnection);
 * user.name = "PlayerOne";
 *
 * @example
 * // Access user properties
 * console.log(user.id); // Unique user ID
 * console.log(user.name); // User's display name
 * if (user.agent) {
 *   console.log(user.agent.getPosition()); // User's agent position
 * }
 */
export function User(socket) {
  /** @type {number} Unique identifier for this user */
  this.id = userId++;

  /** @type {Object} WebSocket connection for client communication */
  this.socket = socket;

  /** @type {Camera|null} User's camera for viewing the game world. Defined when connected. */
  this.camera = null; //User camera. To be defined when connected.

  /** @type {Object|null} Agent representing the user in the game world. Defined when connected. */
  this.agent = null; //Agent representing the user. To be defined when connected.

  /** @type {string} Display name for the user */
  this.name = "";
}
