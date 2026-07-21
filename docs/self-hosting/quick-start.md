# Quick start

The fastest and **recommended** way to self-host TypeType is the install script. It
sets up the whole stack for you, secrets, free ports, services, and the object store
for downloads, so you get a complete, working instance in one command.

::: tip Prefer doing it by hand?
Everything the script does is also documented step by step in
[Manual setup](./docker-compose), if you want full control or to understand each part.
:::

## One command

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash
```

The installer:

- creates `~/typetype-stack` with the compose file and its companions,
- generates the downloader, Garage RPC, and YouTube session secrets,
- picks free ports automatically when the defaults are taken,
- starts every service,
- and bootstraps Garage, so **downloads work out of the box**.

It is interactive. It downloads and prepares the stack files first, then asks for
confirmation before pulling images and starting containers.

### Download only

To fetch the files and review them before starting Docker yourself:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --download-only
```

## Check it is up

```sh
cd ~/typetype-stack
docker compose ps
docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/health
```

The second command checks Server from inside its container, so it remains correct
when the installer selects a different host port.

## Create the admin account

Open the web app (the installer prints the exact URL, `http://localhost:8082` by
default). On a fresh install it asks you to create an account, and the **first account
becomes the administrator** automatically.

![The registration screen on a fresh install](/screenshot-register.png)

Enter a name, email, and password, then **Register**. You are signed in as the admin
and land on the onboarding screen, where you can import your data.

![Signed in as the administrator](/screenshot-onboarding.png)

The whole flow:

![Creating the admin account](/register-admin.gif)

## Next

- Put it on your own domain with HTTPS, [Reverse proxy and HTTPS](./reverse-proxy).
- Tune ports, database, and secrets, [Configuration](./configuration).
- Keep it healthy, [Maintenance](./maintenance).
