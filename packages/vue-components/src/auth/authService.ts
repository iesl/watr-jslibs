
import auth0, { AuthorizeOptions } from "auth0-js";

import { EventEmitter } from "events";
import authConfig from "@/../auth_config.json";

const localStorageKey = "loggedIn";
const loginEvent = "loginEvent";

const webAuth = new auth0.WebAuth({
  domain: authConfig.domain,
  redirectUri: `${window.location.origin}/callback`,
  clientID: authConfig.clientId,
  responseType: 'id_token',
  scope: 'openid profile email'
});

class AuthService extends EventEmitter {
  idToken: string | null = null;
  profile: any | null = null;
  tokenExpiry: Date | null = null;

  // Starts the user login flow
  // login(customState: AuthorizeOptions) {

  login(opts: AuthorizeOptions) {
    webAuth.authorize(
     opts 
    );
  }

  // Handles the callback request from Auth0
  handleAuthentication() {
    console.log('handleAuthentication');

    return new Promise((resolve, reject) => {
      webAuth.parseHash((err: any, authResult: any) => {
        if (err) {
          reject(err);
        } else {
          this.localLogin(authResult);
          resolve(authResult.idToken);
        }
      });
    });
  }

  localLogin(authResult: any) {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;

    // Convert the JWT expiry time from seconds to milliseconds
    this.tokenExpiry = new Date(this.profile.exp * 1000);


    localStorage.setItem(localStorageKey, 'true');

    this.emit(loginEvent, {
      loggedIn: true,
      profile: authResult.idTokenPayload,
      state: authResult.appState || {}
    });
  }

  renewTokens() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(localStorageKey) !== "true") {
        reject("Not logged in");
        return;
      }

      webAuth.checkSession({}, (err, authResult) => {
        if (err) {
          reject(err);
        } else {
          this.localLogin(authResult);
          resolve(authResult);
        }
      });
    });
  }

  logOut() {
    localStorage.removeItem(localStorageKey);

    this.idToken = null;
    this.tokenExpiry = null;
    this.profile = null;

    webAuth.logout({
      returnTo: window.location.origin
    });

    this.emit(loginEvent, { loggedIn: false });
  }

  isAuthenticated() {
    return (
      Date.now() < this.tokenExpiry!.getTime() &&
      localStorage.getItem(localStorageKey) === 'true'
    );
  }
}

export default new AuthService();
