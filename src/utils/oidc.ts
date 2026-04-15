import { UserManager, WebStorageStateStore, type UserManagerSettings } from "oidc-client-ts";

const oidcConfig: UserManagerSettings = {
  authority: import.meta.env.VITE_B1_AUTH_URL,
  client_id: import.meta.env.VITE_B1_AUTH_CLIENT_ID,
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid",
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

export const userManager = new UserManager(oidcConfig);
