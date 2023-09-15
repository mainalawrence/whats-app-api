## Install
1- clone project 

```bash
git clone git@gitlab.com:serverscomsa1/api-v2.git
```

2- install node

https://nodejs.org/en/

3- install yarn

```bash
sudo npm install -g yarn
```
4- install ts-node
https://www.npmjs.com/package/ts-node#installation

```bash
sudo npm install -g typescript
sudo npm install -g ts-node
sudo npm install -g tslib @types/node
```

5- install homebrew
https://docs.brew.sh/Installation

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
git clone https://github.com/Homebrew/brew homebrew
eval "$(homebrew/bin/brew shellenv)"
```

6- install redis

```bash
brew install redis
```
start redis
```bash
brew services start redis
```

5- run project

```
ts-node app.ts
```

- Note: if you have problem with `ts-node app.ts` be sure you have latest version of node and typescript (current version is 18.12.1)
