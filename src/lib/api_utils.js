import Cookies from 'js-cookie'
import d_log from 'loglevel'

const form_auth_headers = () => {
  const authToken = Cookies.get('ds_auth0_access_token')
  let hh = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }

  let tx = Cookies.get('ds_session_token')
  if (tx) {
    hh.DeepStoreToken = tx
  }

  return hh
}

const call_backend_url = async (b_url, b_headers) => {
  const resp = await fetch(b_url, {
    headers: b_headers
  })
  let b_resp = await resp.json()
  d_log.debug(b_resp)
  return b_resp
}

const start_session = async () => {
  d_log.debug('start_session start')
  let b_url = `${import.meta.env.VITE_SERVICE_URL}/start`
  let hh = form_auth_headers()
  let ans = await call_backend_url(b_url, hh)
  let session_token = ans.token
  Cookies.set('ds_session_token', session_token, { expires: 60 })
  d_log.debug(ans)
  d_log.debug('start_session end')
}

export default {
  form_auth_headers,
  call_backend_url,
  start_session
}