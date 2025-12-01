import { createContext, useContext, useState, useEffect } from 'react';
import { Auth0Client } from '@auth0/auth0-spa-js';

const Auth0Context = createContext();

export const useAuth0 = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth0 must be used within an Auth0Provider');
  }
  return context;
};

export const Auth0Provider = ({ children }) => {
  const [auth0Client, setAuth0Client] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth0 = async () => {
      try {
        const client = new Auth0Client({
          domain: import.meta.env.VITE_AUTH0_DOMAIN,
          clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
          authorizationParams: {
            redirect_uri: `${window.location.origin}/#/afterlogin`,
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
          cacheLocation: 'localstorage',
        });

        setAuth0Client(client);

        // Check if user is authenticated
        const isAuth = await client.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          const userProfile = await client.getUser();
          setUser(userProfile);
        }

        // Handle redirect callback
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code') && urlParams.has('state')) {
          try {
            await client.handleRedirectCallback();
            const isAuth = await client.isAuthenticated();
            setIsAuthenticated(isAuth);

            if (isAuth) {
              const userProfile = await client.getUser();
              setUser(userProfile);
            }

            // Clean up URL - redirect to afterlogin page without query params
            window.location.hash = '#/afterlogin';
            window.history.replaceState({}, document.title, window.location.origin + '/#/afterlogin');
          } catch (error) {
            console.error('Error handling redirect callback:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing Auth0:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth0();
  }, []);

  const login = async () => {
    if (auth0Client) {
      try {
        await auth0Client.loginWithRedirect({
          authorizationParams: {
            redirect_uri: `${window.location.origin}/#/afterlogin`,
          },
        });
      } catch (error) {
        console.error('Error during login:', error);
      }
    }
  };

  const logout = () => {
    if (auth0Client) {
      try {
        auth0Client.logout({
          logoutParams: {
            returnTo: `${window.location.origin}/#/afterlogout`,
          },
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  };

  const getAccessToken = async () => {
    if (auth0Client) {
      try {
        const token = await auth0Client.getTokenSilently();
        return token;
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    }
    return null;
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    getAccessToken,
  };

  return (
    <Auth0Context.Provider value={value}>
      {children}
    </Auth0Context.Provider>
  );
};
