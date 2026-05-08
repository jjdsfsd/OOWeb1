import { createStartClient } from "@tanstack/react-start/client";
import { createRouter } from "./router";

const router = createRouter();

createStartClient(router).hydrate();
