hasAllUrlsPermission = () => {
  return browser.permissions.getAll().then((permissions) => {
    return permissions.origins.indexOf("<all_urls>") > -1;
  });
};

requestAllUrlsPermission = () => {
  return browser.permissions.request({ origins: ["<all_urls>"] });
};

hasPermission = () => {
  return browser.permissions.getAll().then((permissions) => {
    return permissions.origins.indexOf("https://news.ycombinator.com/*") > -1;
  });
};

requestPermission = () => {
  return browser.permissions.request({
    origins: ["https://news.ycombinator.com/*", "*://*/*?*hnid=*"],
  });
};

async function setup() {
  if (!(await hasPermission())) {
    const requestPermissionButton = document.getElementById("permissions");
    requestPermissionButton.addEventListener("click", () => {
      requestPermission().then(() => {
        requestPermissionButton.style.display = "none";
        browser.tabs.reload();
        setup();
      });
    });
    requestPermissionButton.style.display = "block";
    return;
  }

  const settings = await browser.storage.sync.get("disabledDomains");
  const tab = (
    await browser.tabs.query({ active: true, lastFocusedWindow: true })
  )[0];
  const url = new URL(tab.url);

  const toggleHostButton = document.getElementById("toggle-host");
  toggleHostButton.addEventListener("click", () => {
    if (!settings.disabledDomains) {
      settings.disabledDomains = {};
    }
    settings.disabledDomains[url.hostname] =
      !settings.disabledDomains[url.hostname];
    browser.storage.sync
      .set({
        disabledDomains: settings.disabledDomains,
      })
      .then(() => {
        browser.tabs.reload();
        toggleHostButton.innerHTML = `<b>${
          settings.disabledDomains[url.hostname] ? "Enable" : "Disable"
        }</b> for <code>${url.hostname}</code>`;
      });
  });

  toggleHostButton.innerHTML = `<b>${
    settings.disabledDomains && settings.disabledDomains[url.hostname]
      ? "Enable"
      : "Disable"
  }</b> for <code>${url.hostname}</code>`;

  const sourceCodeLink = document.getElementById("source-code-link");
  const ltgLink = document.getElementById("ltg-link");
  if (url.hostname === "news.ycombinator.com") {
    toggleHostButton.style.display = "none";
    sourceCodeLink.style.display = "block";
    ltgLink.style.display = "block";
  } else {
    toggleHostButton.style.display = "block";
    sourceCodeLink.style.display = "none";
    ltgLink.style.display = "none";
  }
}

setup();
