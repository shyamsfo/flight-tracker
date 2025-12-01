import d_log from 'loglevel'
import Cookies from 'js-cookie'
import nu_bus from "./EventBus.js";

function show_loader(val='hello') {
  nu_bus.emit('loading', { status: true })
}
function hide_loader(val='hello') {
  nu_bus.emit('loading', { status: false })
}
function app_ready() {

}
function log_me(val='hello') {
  d_log.debug(val);
}
function do_login(val) {
  d_log.debug(`setting cookie to ${val}`)
  Cookies.set('nu-session', val, {expires: 7})
}
function is_logged_in() {
  let xx = Cookies.get('nu-session')
  if (xx == null) {
    return false;
  }
  d_log.debug(`Login cookie: ${xx}`);
  if (xx) {
    return true;
  }
}
function do_logout() {
  Cookies.remove('nu-session')
}
function alert_me(val='hello') {
  alert(val)
}
async function copy_to_clipboard(text) {
  if(!navigator.clipboard) {
    alert('navigator.clipboard API not avalable');
    return;
  }
  navigator.clipboard.writeText(text);
}
export default {
  alert_me,
  log_me,
  copy_to_clipboard,
  do_logout,
  do_login,
  is_logged_in,
  show_loader,
  hide_loader,
  app_ready,
}
