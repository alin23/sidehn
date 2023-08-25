window.addHNComments = (id) => {
  // Create the iframe element
  const iframe = document.createElement("iframe");
  const bodyStyle = getComputedStyle(document.body);

  // Set the source of the iframe to the Hacker News comments page for the given URL
  iframe.src = `https://news.ycombinator.com/item?id=${id}`;

  // Set the width and height of the iframe
  iframe.style.width = "30%";
  iframe.style.minWidth = "30%";
  iframe.style.maxWidth = "30%";
  iframe.style.height = "100%";
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.right = "-30%";
  iframe.style.zIndex = 1000;

  // Create the close button (a right chevron placed on the left side of the iframe)
  const closeButton = document.createElement("button");
  closeButton.innerHTML = window.innerWidth >= 1024 ? "&#9656;" : "&#9666;";
  closeButton.style.position = "fixed";
  closeButton.style.top = "calc(50% - 3rem)";
  closeButton.style.right = "0";
  closeButton.style.height = "3rem";
  closeButton.style.width = "1.5rem";
  closeButton.style.backgroundColor = "hsla(21, 84%, 55%, 1.00)";
  closeButton.style.fontSize = "1.5rem";
  closeButton.style.cursor = "pointer";
  closeButton.style.outline = "none";
  closeButton.style.color = "black";
  closeButton.style.borderRadius = "0.5rem 0 0 0.5rem";
  closeButton.style.zIndex = 1001;

  window.hnIframeHiddenManually = false;
  closeButton.addEventListener("click", () => {
    if (window.hnIframeShown) {
      window.hnIframeHiddenManually = true;
      window.hideHNComments();
    } else {
      window.hnIframeHiddenManually = false;
      window.showHNComments();
    }
  });

  window.hideHNComments = () => {
    iframe.style.right = "-30%";
    closeButton.innerHTML = "&#9666;";
    document.getElementById("hn-iframe-placeholder").style.display = "none";

    const bodyContainer = document.getElementById("hn-body-container");
    bodyContainer.style.maxWidth = "100%";
    bodyContainer.style.width = "100%";
    bodyContainer.style.flex = 1;
    window.hnIframeShown = false;
  };

  window.showHNComments = () => {
    iframe.style.right = "0";
    closeButton.innerHTML = "&#9656;";
    document.getElementById("hn-iframe-placeholder").style.display = "block";

    const bodyContainer = document.getElementById("hn-body-container");
    bodyContainer.style.maxWidth = "70%";
    bodyContainer.style.width = `calc(70% - ${bodyStyle.padding || 0})`;
    bodyContainer.style.flex = 0.7;
    window.hnIframeShown = true;
  };

  // Create a flex container to hold the website contents and the iframe
  const flexContainer = document.createElement("div");
  flexContainer.id = "hn-flex-container";
  flexContainer.style.display = "flex";

  // Container for holding the body contents
  const bodyContainer = document.createElement("div");
  bodyContainer.id = "hn-body-container";
  bodyContainer.style.flexGrow = 0.7;
  bodyContainer.style.width = `calc(70% - ${bodyStyle.padding || 0})`;
  bodyContainer.style.minWidth = "50%";
  bodyContainer.style.maxWidth = "70%";
  bodyContainer.style.margin = bodyStyle.margin;
  bodyContainer.style.padding = bodyStyle.padding;
  bodyContainer.innerHTML = document.body.innerHTML;
  flexContainer.innerHTML = bodyContainer.outerHTML;

  // Create a placeholder for the iframe that will be 30% of the flex container
  // to push body contents to the left of the sidebar
  const iframePlaceholder = document.createElement("div");
  iframePlaceholder.id = "hn-iframe-placeholder";
  iframePlaceholder.style.width = "30%";
  iframePlaceholder.style.minWidth = "30%";
  iframePlaceholder.style.maxWidth = "30%";
  iframePlaceholder.style.height = "100vh";
  iframePlaceholder.style.flex = 0.3;
  iframePlaceholder.style.backgroundColor = "hsla(60, 25%, 95%, 1.00)";

  flexContainer.appendChild(iframePlaceholder);
  document.body.innerHTML = flexContainer.outerHTML;
  document.body.appendChild(iframe);
  document.body.appendChild(closeButton);
  document.body.style.margin = 0;
  document.body.style.padding = 0;
  document.body.style.width = "100%";
  document.body.style.minWidth = "100%";
  document.body.style.maxWidth = "100%";

  // Show/hide the iframe based on the width of the page
  function toggleIframe() {
    if (window.innerWidth < 1024) {
      window.hideHNComments();
    } else if (!window.hnIframeHiddenManually) {
      window.showHNComments();
    }
  }

  // Call toggleIframe on page load and on window resize
  window.addEventListener("load", toggleIframe);
  window.addEventListener("resize", toggleIframe);
  toggleIframe();
};

if (location.hostname == "news.ycombinator.com") {
  // if we're on HN, add the item ID to the URL as a hash fragment
  window.hnObserver = new MutationObserver(() => {
    const hnItems = document.querySelectorAll(".hn-item");
    hnItems.forEach((item) => {
      const link = item.querySelector("a.hn-item-title");
      if (!link.href.includes("news.ycombinator.com")) {
        link.href = link.href.replace(/#hnid=\d+/, "") + `#hnid=${item.id}`;
      }
    });
  });

  window.hnObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
} else {
  // otherwise, check if we got here from HN and add the comments sidebar
  const hnidMatch = location.hash.match(/hnid=(\d+)/);
  if (hnidMatch) {
    window.addHNComments(hnidMatch[1]);
  }
}
