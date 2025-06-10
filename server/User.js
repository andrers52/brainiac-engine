"use strict";

var userId = 0;
export function User(socket) {
  this.id = userId++;
  this.socket = socket;
  this.camera = null; //User camera. To be defined when connected.

  this.agent = null; //Agent representing the user. To be defined when connected.
  this.name = "";
}
