export function isBase64(str) {
  // Regular expression to match base64 pattern
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  try {
    if (!base64Regex.test(str)) return false;

    const decoded = atob(str);
    const encoded = btoa(decoded);

    return encoded === str;
  } catch (err) {
    return false;
  }
}

export function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
//

export function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim leading/trailing white space
  str = str.toLowerCase(); // convert string to lowercase
  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove any non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
  return str;
}

export function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function decoderBase64ToUtf8(str) {
  return decodeURIComponent(escape(atob(str)));
}

export function handleLoaderPostMessage(enable = true) {
  window.parent.postMessage(
    {
      type: enable ? "ENABLE_LOADER_POSTMESSAGE" : "DISABLE_LOADER_POSTMESSAGE",
    },
    "*",
  );
}
