"use client";
import { IOType } from "child_process";
import { Socket } from "socket.io";
import { io } from "socket.io-client";

export const socket = io("/atlas");