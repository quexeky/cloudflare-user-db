import Buffer from "node:buffer";

export async function encrypt_data(data: Buffer.Buffer, binding: Fetcher) {
    const fetched_data = await binding.fetch("http://example.com/encrypt", {
        method: "POST", body: JSON.stringify({plaintext: data.toString('base64')}), headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });

    return JSON.parse(new TextDecoder().decode((await fetched_data.body.getReader().read()).value));
}


export async function decrypt_data(ciphertext: string, iv: string, binding: Fetcher) {
    const fetched_data = await binding.fetch("http://localhost:8787/decrypt", {
        method: "POST", body: JSON.stringify({ciphertext: ciphertext, iv: iv}), headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });

    return fetched_data.body.getReader().read();
}