import { fromHono } from "chanfana";
import { Hono } from "hono";
import {UserCreation} from "./endpoints/userCreation";
import {UserAuthenticator} from "./endpoints/userAuthenticator";

// Start a Hono app
const app = new Hono();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/api/user", UserCreation);
openapi.get("/api/user", UserAuthenticator);

// Export the Hono app
export default app;
