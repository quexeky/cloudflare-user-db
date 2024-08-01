import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import {compareSync, hashSync} from "bcryptjs";
import Buffer from "node:buffer";
import {decrypt_data} from "../../util";

export class UserAuthenticator extends OpenAPIRoute {
    schema = {
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            username: z.string().max(32),
                            password: z.string().base64().length(8), // 512 bit password hash
                        })
                    }
                }
            }
        }

    }
    async handle(c) {
        const data = await this.getValidatedData<typeof this.schema>();

        const recvPassword = data.body.password;

        console.log("RecvPassword:", recvPassword);

        const user = await c.env.DB.prepare(
            "SELECT * FROM users WHERE username = ?1",
        ).bind(data.body.username).run();

        //console.log(hashSync(recvPassword));

        const password = await decrypt_data(user.results[0].password, user.results[0].iv, c.env.ENCDEC);
        console.log("Password:", password);

        console.log("User:", user);
        const base64_password = JSON.parse(Buffer.Buffer.from(password.value).toString()).result.plaintext;
        console.log("Base64 Password:", base64_password);

        const result = compareSync(recvPassword, base64_password);

        console.log(result);
        if (result) {
            return new Response(undefined, { status: 200 });
        }
        return new Response(undefined, { status: 401 });

    }
}