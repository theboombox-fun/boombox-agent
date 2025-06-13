# Boombox Agent

This repository contains an agent project that enables creating tokens with audio files through the XMTP network. Created boxes can be published on [theboombox.fun](https://theboombox.fun) (optional).

## Getting started

> [!TIP]
> You can learn how to use the application [here](https://youtu.be/djRLnWUvwIA).
> See XMTP's [cursor rules](/.cursor/README.md) for vibe coding agents and best practices.

### Requirements

- Node.js v20 or higher
- Yarn v4 or higher
- Docker (optional, for local network)

### Environment variables

To run your Boombox agent, you must create a `.env` file with the following variables:

```bash
#General
PORT=
NODE_ENV=dev # local, development, production
XMTP_ENV=dev # local, dev, production
DATABASE_URL= # Database for the application (postgresql://...)
#Cloudflare
CF_ACCOUNT_ID= # Cloudflare Account Id
CF_API_TOKEN= # Cloudflare Api Token (For Cloudflare Image Service)
CF_ACCESS_KEY= # Cloudflare Access Key (For Cloudflare R2 Service)
CF_SECRET_KEY= # Cloudflare Secret Key (For Cloudflare R2 Service)
#Clanker
CLANKER_FACTORY= # Clanker Factory address
CLANKER_FACTORY_V2= # Clanker Factory V2 address
#Other Keys
CLIENT_API_KEY= # For client side endpoints
AES_SECRET_KEY= # For database encryption
BOT_PRIVATE_KEY= # For XMTP bot (0x....)
OPENAI_API_KEY= 
COINGECKO_API_KEY= # To fetch current token data
CLANKER_API_KEY= # To create tokens through Clanker
BOOMBOX_API_KEY= # To list on theboombox.fun
#Sentry
SENTRY_AUTH_TOKEN=
```

> [!NOTE]
> You can access the current clanker factory addresses [here](https://clanker.gitbook.io/clanker-documentation/references/deployed-contracts)

> [!NOTE]
> If you want the created boxes to be listed on theboombox.fun, you can contact [here](https://x.com/0xberkxyz) for 'BOOMBOX_API_KEY'

### Run the agent

```bash
# git clone repo
git clone https://github.com/theboombox-fun/boombox-agent.git
# go to the folder
cd boombox-public
# install packages
yarn
# run the example
yarn dev
```

### Work in local network

`dev` and `production` networks are hosted by XMTP, while `local` network is hosted by yourself.

- 1. Install docker
- 2. Start the XMTP service and database

```bash
./dev/up
```

- 3. Change the .env file to use the local network

```bash
XMTP_ENV = local
```

## Why XMTP?

- **End-to-end & compliant**: Data is encrypted in transit and at rest, meeting strict security and regulatory standards.
- **Open-source & trustless**: Built on top of the [MLS](https://messaginglayersecurity.rocks/) protocol, it replaces trust in centralized certificate authorities with cryptographic proofs.
- **Privacy & metadata protection**: Offers anonymous usage through SDKs and pseudonymous usage with nodes tracking minimum metadata.
- **Decentralized**: Operates on a peer-to-peer network, eliminating single points of failure and ensuring continued operation even if some nodes go offline.
- **Multi-agent**: Allows confidential communication between multiple agents and humans through MLS group chats.
