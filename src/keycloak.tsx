import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: `${process.env.AUTH_LINK}`,
  realm: "master",
  clientId: 'sonant'
});

let initPromise: Promise<boolean> | undefined;

export const initKeycloak = () =>
(initPromise ??= keycloak.init({
  onLoad: 'login-required',
  pkceMethod: 'S256',
}));
