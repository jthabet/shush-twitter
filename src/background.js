// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: "twitter_mute_word_select",
    title: "Twitter mute",
    type: "normal",
    contexts: ["selection"],
    documentUrlPatterns: ["*://twitter.com/*"],
  });

  // Opens the options page on install
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }

  // Initialize the debug flag to false
  // auto create and set debug flag to false
  chrome.storage.local
    .set({ options: { debug: false } })
    .catch((err) => console.error(err));
});

// Mute the selected keyword when the user clicks the contextual menu
chrome.contextMenus.onClicked.addListener((item) => {
  if (item.menuItemId === "twitter_mute_word_select") {
    chrome.cookies.get(
      { url: "https://twitter.com", name: "ct0" },
      (response) => {
        let csrfToken = response.value;
        chrome.storage.local.get("bearer").then((result) => {
          addKeyword(result.bearer, item.selectionText, csrfToken)
            .then((response) => {
              console.info(
                "successfully added keyword : %s",
                item.selectionText
              );
            })
            .catch((reason) => {
              chrome.storage.local.get("options", function (result) {
                if (result.options.debug) {
                  console.error(reason);
                }
              });
            });
        });
      }
    );
  }
});

function addKeyword(bearerToken, word, CSRFToken) {
  const form = new URLSearchParams();
  form.append("keyword", word);
  form.append("mute_surfaces", "notifications,home_timeline,tweet_replies");
  form.append("mute_options", "");
  form.append("duration", "");

  return fetch("https://twitter.com/i/api/1.1/mutes/keywords/create.json", {
    headers: {
      authorization: `Bearer ${bearerToken}`,
      "content-type": "application/x-www-form-urlencoded",
      "x-csrf-token": CSRFToken,
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-client-language": "en",
    },
    body: form.toString(),
    method: "POST",
  });
}
