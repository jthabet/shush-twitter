import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Keyword } from "./types/keywords";
import { IconX } from "@tabler/icons-react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

const rootElement = document.getElementById("popup");
if (!rootElement) throw new Error("Failed to find root element");
const root = createRoot(rootElement);
root.render(
  <QueryClientProvider client={queryClient}>
    <Popup />
  </QueryClientProvider>
);

function Popup() {
  const [keywords, setKeywords] = useState<Keyword[]>();

  const { isLoading, data, error } = useQuery({
    queryKey: ["listKeywords"],
    queryFn: () =>
      chrome.cookies
        .get({ url: "https://twitter.com", name: "ct0" })
        .then((response) => {
          const csrf_token = response?.value;
          return chrome.storage.local.get("bearer").then((result) =>
            getKeywordsList(result.bearer, csrf_token)
              .then((r) => r.json())
              .then((result) => result.muted_keywords as Array<Keyword>)
              .catch((err) => console.error(err))
          );
        }),
  });

  useEffect(() => {
    setKeywords(data as Keyword[]);
  }, [data]);

  if (isLoading)
    return (
      <div>
        <p className="mt-10 text-center dark:text-white">Loading.....</p>
      </div>
    );

  if (error instanceof Error)
    return (
      <div>
        <p className="mt-10 text-center dark:text-white">
          An error has occurred: {error.message}
        </p>
      </div>
    );

  return (
    <ul className="mt-2 list-none">
      {keywords?.map((item) => (
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
              removeWord(item.id as string);
              setKeywords(keywords.filter((obj) => obj.id !== item.id));
            }}
          >
            <IconX size={20} strokeWidth={1} />
          </button>
        </li>
      ))}
    </ul>
  );
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
        destroyKeyword(id, result.bearer, csrf_token as string)
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
