# Cloudflare User DB Service
A starter project for creating and authenticating users using bcrypt, usernames, and user IDs

# Setup
This setup assumes a pre-configured wrangler CLI, although includes the package itself within the dependencies. For more details, see
[Cloudflare Docs](https://developers.cloudflare.com/workers/wrangler/install-and-update/) \
```git clone https://github.com/quexeky/cloudflare-user-db.git``` \
```cd cloudflare-user-db``` \
```npm i``` \
```npx wrangler d1 create user-db``` \
```npx wrangler d1 execute user-db --command "CREATE TABLE users(username TEXT PRIMARY KEY UNIQUE, password TEXT NOT NULL, email TEXT, user_id)"``` \
Take note of the "database_id" value provided and replace <DATABASE_ID> with that value
```toml
# wrangler.toml

# ...

[[d1_databases]]
binding = "DB" 
database_name = "user-db"
database_id = "<PASTE DATABASE_ID HERE>"

# ...
```
## Secrets
For the following commands, you will be prompted to provide a secret value, which must be 512 bits long and encoded as 
88 base64 characters. This value should be securely random, such as through this python script:
```python
import os
import base65
s = bytearray(os.urandom(64))
print(base64.b64encode(s))
```
Take note of the "USER_CREATION_AUTH_KEY" and "USER_ID_AUTH_KEY" for quexeky-auth setup. For the "USER_ID_AUTH_KEY",
use the previous "USER_ID_AUTH_KEY" from the "cloudflare-user-data" service. \
```npx wrangler secrets put USER_CREATION_AUTH_KEY``` \
```npx wrangler secrets put USER_DATA_AUTH_KEY``` \
```npx wrangler secrets put USER_ID_AUTH_KEY```

# Deploy
```npx wrangler deploy```