import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Keyword } from "./types/keywords";
import { IconX } from "@tabler/icons-react";

const rootElement = document.getElementById("popup");
if (!rootElement) throw new Error("Failed to find root element");
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Popup />
  </StrictMode>
);

function Popup() {
  const [words, setWords] = useState<Array<Keyword>>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    chrome.cookies.get(
      { url: "https://twitter.com", name: "ct0" },
      (response) => {
        const csrf_token = response?.value;
        chrome.storage.local.get("bearer", function (result) {
          if (result.bearer) {
            setIsConfigured(true);
            getKeywordsList(result.bearer, csrf_token)
              .then((r) => r.json())
              .then((result) => {
                setWords(result.muted_keywords);
                console.log(result);
              })
              .catch((err) => console.error(err));
          }
        });
      }
    );
  }, []);

  return (
    <>
      <ul className="mt-2 list-none space-y-3">
        {isConfigured ? (
          <Item words={words} setWords={setWords} />
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p className="mt-10 text-center dark:text-white">
              Token not Configured
            </p>
            <button
              className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={(e) => {
                chrome.runtime.openOptionsPage();
              }}
            >
              Configure
            </button>
          </div>
        )}
      </ul>
    </>
  );
}

interface ItemInput {
  words: Array<Keyword>;
  setWords: React.Dispatch<React.SetStateAction<Array<Keyword>>>;
}

function Item({ words, setWords }: ItemInput) {
  const list = words.map((item) => (
    <li
      key={item.id}
      className="flex justify-end gap-2 truncate pr-2 text-slate-900 dark:text-white"
    >
      <div className="flex-wrap">{item.keyword}</div>
      <button
        className="rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
        onClick={() => {
          chrome.storage.local.get("options", function (result) {
            if (result.options.debug) {
              console.debug("clicked on remove word button");
            }
          });
          removeWord(item.id!);
          const filtered = words.filter((obj) => obj.id != item.id);
          setWords(filtered);
        }}
      >
        <IconX size={20} strokeWidth={1} />
      </button>
    </li>
  ));

  return <>{list}</>;
}

export function getKeywordsList(
  bearerToken: string,
  csrfToken: string | undefined
) {
  const headers = new Headers();
  headers.append("authorization", `Bearer ${bearerToken}`);
  headers.append("content-type", "application/x-www-form-urlencoded");
  headers.append("x-csrf-token", csrfToken || "");
  headers.append("x-twitter-active-user", "yes");
  headers.append("x-twitter-auth-type", "OAuth2Session");
  headers.append("x-twitter-client-language", "en");

  return fetch("https://twitter.com/i/api/1.1/mutes/keywords/list.json", {
    headers: headers,
    method: "GET",
  });
}

// removeWord authenticates and destroys the provided keyword by ID.
function removeWord(id: string) {
  chrome.cookies.get(
    { url: "https://twitter.com", name: "ct0" },
    (response) => {
      const csrf_token = response?.value;

      chrome.storage.local.get("bearer", function (result) {
        destroyKeyword(id, result.bearer, csrf_token!)
          .then((res) => {
            chrome.storage.local.get("options", function (result) {
              if (result.options.debug) {
                console.log(res);
              }
            });
          })
          .catch((err) => console.error(err));
      });
    }
  );
}

function destroyKeyword(id: string, bearerToken: string, csrfToken: string) {
  return fetch("https://twitter.com/i/api/1.1/mutes/keywords/destroy.json", {
    headers: {
      authorization: `Bearer ${bearerToken}`,
      "content-type": "application/x-www-form-urlencoded",
      "x-csrf-token": csrfToken,
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-client-language": "en",
    },

    body: `ids=${id}`,
    method: "POST",
  });
}
