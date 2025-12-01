
function random_str() {
  return (Math.random() + 1).toString(36).substring(2);
}

export default {
  random_str,
}
