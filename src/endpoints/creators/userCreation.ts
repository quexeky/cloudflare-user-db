import {OpenAPIRoute} from "chanfana";
import {z} from "zod";
import {hashSync} from "bcryptjs";
import * as test from "node:test";
import Buffer from "node:buffer"

export class UserCreation extends OpenAPIRoute {
    schema = {
        request: {
            query: z.object({
                username: z.string().max(32),
                password: z.string().base64().length(8), // 512 bit password hash
                email: z.string().max(256).optional(),
                auth_key: z.string().length(64),

            })
        }
    }

    async handle(c) {
        const data = await this.getValidatedData<typeof this.schema>();
        if (data.query.auth_key !== c.env.AUTH_KEY) {
            return new Response(undefined, {status: 401});
        }

        const fetch_data = await c.env.ENCDEC.fetch("http://localhost:8787/encrypt", {
            method: "POST", body: JSON.stringify({plaintext: data}), headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        const test_fetch = await c.env.ENCDEC.fetch("http://localhost:8787/encrypt", {
            method: "POST", body: JSON.stringify({ plaintext: "aaaaa" }), headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        //console.log("Fetch Data:", test_fetch);
        console.log("Body:", await test_fetch.body.getReader().read());

        const existing = await c.env.DB.prepare(
            "SELECT * FROM users WHERE username = ?1",
        ).bind(data.query.username).run();
        if (existing.results.length > 0) {
            return new Response(undefined, {status: 409});
        }
        console.log(c.env.AUTH_KEY);

        const recvPassword = data.query.password;
        const email = (email: string) => {
            if (!email) {
                return null;
            }
            return email;
        };

        const password = hashSync(recvPassword);
        console.log("Password:", password);

        const encrypted_hashed_password = await encrypt_data(Buffer.Buffer.from(password), c.env.ENCDEC);


        console.log("User:", data.query.username);

        const result = await c.env.DB.prepare(
            "INSERT INTO users(username, password, email) VALUES(?, ?, ?)"
        ).bind(data.query.username, encrypted_hashed_password, email(data.query.email)).run();

        console.log(result);

        if (result.success) {
            return new Response(undefined, {status: 201});
        }
        return new Response(fetch_data, {status: 400});
    }
}

async function encrypt_data(data: Buffer.Buffer, binding: Fetcher) {
    const fetched_data = await binding.fetch("http://example.com/encrypt", {
        method: "POST", body: JSON.stringify({ plaintext: data.toString('hex') }), headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });

    return fetched_data.body.getReader().read();
}
