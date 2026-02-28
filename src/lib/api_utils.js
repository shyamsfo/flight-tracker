import Cookies from 'js-cookie'
import d_log from 'loglevel'

const BASE_URL = import.meta.env.VITE_SERVICE_URL

const form_auth_headers = (authToken) => {
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

const request = async (authToken, method, path, { params, body } = {}) => {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const options = {
    method,
    headers: form_auth_headers(authToken)
  }
  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const resp = await fetch(url, options)
  if (!resp.ok) {
    const errorBody = await resp.text()
    d_log.error(`${method} ${path} failed (${resp.status}):`, errorBody)
    const err = new Error(`API error ${resp.status}: ${resp.statusText}`)
    err.status = resp.status
    err.body = errorBody
    throw err
  }

  const data = await resp.json()
  d_log.debug(`${method} ${path}`, data)
  return data
}

const get_data = (authToken, path, params = {}) =>
  request(authToken, 'GET', path, { params })

const post_data = (authToken, path, body = {}) =>
  request(authToken, 'POST', path, { body })

const put_data = (authToken, path, body = {}) =>
  request(authToken, 'PUT', path, { body })

const patch_data = (authToken, path, body = {}) =>
  request(authToken, 'PATCH', path, { body })

const delete_data = (authToken, path, params = {}) =>
  request(authToken, 'DELETE', path, { params })

const start_session = async (authToken) => {
  d_log.debug('start_session start')
  let ans = await get_data(authToken, '/start')
  let session_token = ans.token
  Cookies.set('ds_session_token', session_token, { expires: 60 })
  d_log.debug(ans)
  d_log.debug('start_session end')
}

export default {
  get_data,
  post_data,
  put_data,
  patch_data,
  delete_data,
  start_session,
  form_auth_headers
}
