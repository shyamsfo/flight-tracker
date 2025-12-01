import d_a_client from "@libs/auth0.js";
import d_log from "loglevel";
import Cookies from "js-cookie";

async function get_user_metadata(access_token, user_sub) {
    console.log('get_user_metadata start')
    try {
        const userDetailsByIdUrl = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${user_sub}`;
        const resp = await fetch(userDetailsByIdUrl, {
            headers: {
                Authorization: `Bearer ${access_token}`
            },
        });
        if (resp.status != 200) {
            console.log(resp);
            return await resp.json();
        }
        console.log('get_user_metadata end')
        return await resp.json();
    }
    catch(e) {
        alert(e);
        return null;
    }
}
async function get_auth_token_for_user_info(getAccessTokenSilently, getAccessTokenWithPopup) {
    let auth_params =  {
        ignoreCache: true,
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URL,
        scope: "openid profile email",
    }
    return get_auth_token(getAccessTokenSilently, getAccessTokenWithPopup, auth_params) ;
}
async function get_auth_token_for_server(getAccessTokenSilently, getAccessTokenWithPopup) {
    let audience = import.meta.env.VITE_AUTH0_AUDIENCE
    let auth_params =  {
        ignoreCache: true,
        redirect_uri: `${import.meta.env.VITE_AUTH0_REDIRECT_URL}`,
        scope: "openid profile email",
        audience: audience
    }
    return get_auth_token(getAccessTokenSilently, getAccessTokenWithPopup, auth_params) ;
}

async function get_auth_token(getAccessTokenSilently, getAccessTokenWithPopup, auth_params) {
    try {
        let accessToken1 = await getAccessTokenSilently({
            ignoreCache: true,
            redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URL,
            authorizationParams: auth_params
        });
        return accessToken1;
    }
    catch(e) {
        console.error(e);
        try {
        let accessToken2 = await getAccessTokenWithPopup({
            ignoreCache: true,
            redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URL,
            authorizationParams: auth_params
        });
        return accessToken2;
        }
        catch(e) {
            console.error(e);
        }
    }
    return null;
}

export default {
    get_auth_token,
    get_auth_token_for_server,
    get_auth_token_for_user_info,
    get_user_metadata,
}
