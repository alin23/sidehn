if (!('browser' in self)) {
  self.browser = self.chrome;
}

async function toggleCookieIframeInjector(cookie) {
  var cookie =
    cookie !== undefined
      ? cookie
      : await browser.cookies.get({
          url: "https://news.ycombinator.com",
          name: "user",
        });

  if (!cookie) {
    console.log("Removing cookie iframe injector");
    browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [5],
    });
    return;
  }

  console.log(`Adding cookie iframe injector`);
  browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [5],
    addRules: [
      {
        id: 5,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "Cookie",
              operation: "set",
              value: `user=${cookie.value}`,
            },
            {
              header: "Sec-Fetch-Dest",
              operation: "set",
              value: "document",
            },
            {
              header: "Sec-Fetch-Site",
              operation: "set",
              value: "same-origin",
            },
            {
              header: "Referer",
              operation: "set",
              value: "https://news.ycombinator.com/",
            },
          ],
        },
        condition: {
          urlFilter: "||news.ycombinator.com",
          resourceTypes: ["sub_frame"],
        },
      },
    ],
  });
}

async function handleCookieChange(changeInfo) {
  if (
    changeInfo.cookie.domain !== "news.ycombinator.com" ||
    !changeInfo.cookie.name !== "user"
  ) {
    return;
  }
  console.log(
    `Cookie changed: \n` +
      ` * Cookie: ${JSON.stringify(changeInfo.cookie)}\n` +
      ` * Cause: ${changeInfo.cause}\n` +
      ` * Removed: ${changeInfo.removed}`
  );
  toggleCookieIframeInjector(changeInfo.removed ? null : changeInfo.cookie);
}

async function setupCookies() {
  if (browser.cookies.onChanged.hasListener(handleCookieChange)) {
    console.log("Already listening for cookie changes");
    await toggleCookieIframeInjector();
    return;
  }

  console.log("Adding listener for cookie changes");
  browser.cookies.onChanged.addListener(handleCookieChange);
  await toggleCookieIframeInjector();
}

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    setupCookies();
  }
});
setupCookies();
