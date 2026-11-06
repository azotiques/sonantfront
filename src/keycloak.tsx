import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: `${import.meta.env.VITE_AUTH_LINK}`,
  realm: "master",
  clientId: 'sonant'
});

let initPromise: Promise<boolean> | undefined;

export const initKeycloak = () => {
  return (initPromise ??= keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
  }))
};
