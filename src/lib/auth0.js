import {createAuth0Client} from '@auth0/auth0-spa-js'
import d_log from 'loglevel';
import Cookies from "js-cookie";

class NuwireAuthClient {
  constructor() {
    this.auth0Client = null;
    this.initDone = false;
  }

  isReady() {
    return this.auth0Client != null && this.initDone != false;
  }

  async init() {
    if (this.isReady()) {
      console.error('init already done');
      return;
    }
    const config = {
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    };

    d_log.debug('init start')
    this.auth0Client = await createAuth0Client(config);
    this.initDone = true;
    d_log.debug('init done')
    return this.auth0Client;
  }

  async  do_login () {
    if (!this.isReady()) {
      d_log.error('not ready')
      return;
    }
    try {
      const options = {
        authorizationParams: {
          scope: "openid profile email",
          redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URL,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      };
      d_log.debug(`call login ${import.meta.env.VITE_AUTH0_REDIRECT_URL}`);
      await this.auth0Client.loginWithRedirect(options);
    } catch (err) {
      Cookies.remove('ds_auth0_access_token');
      Cookies.remove('ds_auth0_user');
      d_log.error("Log in failed", err);
    }
  };

  async get_auth_code() {
    const options = {
      authorizationParams: {
        scope: "openid profile email",
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URL,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }
    };
    try {
      let aa = await this.auth0Client.getTokenSilently(options);
      return aa;
    } catch (err) {
      Cookies.remove('ds_auth0_access_token');
      Cookies.remove('ds_auth0_user');
      d_log.error("getTokenSilentlyFailed", err);
      throw err;
    }
  }

  async is_authenticated() {
    d_log.debug('is_authenticated')
    let ans = await this.auth0Client.isAuthenticated();
    return ans;
  }

  async get_user() {
    if (this.auth0Client.isAuthenticated()) {
      d_log.debug('user is authenticated...');
      await this.get_auth_code();
      let aa = await this.auth0Client.getUser();
      console.log(aa);
      return aa;
    }
    d_log.debug('not authenticated?');
    d_log.error('get_user: not authenticated. cant get_user')
    return null;
  }

  async do_logout () {
    if (!this.isReady()) {
      console.error('not ready')
      return;
    }
    try {
      d_log.debug("Logging out");
      await this.auth0Client.logout({
        logoutParams: {
          client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
          clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
          returnTo: import.meta.env.VITE_AUTH0_AFTER_LOGOUT_URL
        }
      });
    } catch (err) {
      d_log.error("Log out failed", err);
    }
    Cookies.remove('ds_auth0_user')
    Cookies.remove('ds_auth0_access_token')
  };

  async check_auth() {
    if (!this.isReady()) {
      d_log.error('not ready')
      return;
    }
    if (this.auth0Client.isAuthenticated()) {
      d_log.debug("User is authenticated");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    d_log.debug("User not authenticated");
  };
}

let singleton_inst = new NuwireAuthClient()
export default  singleton_inst
