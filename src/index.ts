import { fromHono } from "chanfana";
import { Hono } from "hono";
import {UserCreation} from "./endpoints/creators/userCreation";
import {UserAuthenticator} from "./endpoints/authenticators/userAuthenticator";

// Start a Hono app
const app = new Hono<{Bindings: Env}>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/api/user", UserCreation);
openapi.post("/api/userLogin", UserAuthenticator);

// Export the Hono app
export default app;
