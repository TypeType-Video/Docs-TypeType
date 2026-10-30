# Signing in

Your subscriptions, playlists, history, and settings are tied to your account on the
instance.

## Local account

Create an account with a name, email, and password, then sign in. On a brand-new
instance the **first account becomes the administrator** (see
[Quick start](/self-hosting/quick-start#create-the-admin-account)). If you forget your
password, use the reset flow from the login page.

![The sign-in page](/screenshot-login.png)

The browser keeps the account session refreshed automatically. The short-lived access
token expires after one hour, while the refresh session lasts 30 days. If you are
signed out while actively using the site, that is not a normal inactivity timeout;
ask the instance operator to check
[Unexpected sign-outs](/self-hosting/troubleshooting#unexpected-sign-outs).

## Single sign-on (OIDC)

If your instance has it configured, the login page shows a **Sign in with...** button
for your identity provider (Google, Authentik, Keycloak, and so on). One click signs
you in, no separate password to manage.

Depending on how the admin set it up:

- the page may **redirect straight to your provider** (no login screen at all),
- and **local accounts may be turned off**, so single sign-on is the only way in.

Setting this up is on the admin side, see
[Authentication (OIDC)](/self-hosting/authentication).

## Connect YouTube {#connect-youtube}

Public YouTube videos play without a YouTube account. When YouTube refuses a video
without signing in, for example an age-restricted one, TypeType can play it with a
YouTube account you connect. The watch page then points you to **Login**.

1. Open **Login** in the side menu, then select **Connect with YouTube**.
2. TypeType shows a code. Open `google.com/device` on any device and enter it.
3. Choose the YouTube account and allow access. The status changes to connected.

Use a secondary YouTube account, and enter the code quickly: it expires after a few
minutes. The YouTube session stays on the server, encrypted, and is never sent to the
web page. **Disconnect** removes it. If YouTube stops accepting the session, the
watch page asks you to connect again.

![The YouTube sign-in page with the Connect with YouTube button](/screenshot-youtube-session.png)

The **BiliBili** tab at the top of the same page connects a BiliBili account.

## Your profile

From your profile you manage your account details. Administrators also get an **Admin**
area to review bug reports and manage the instance.
