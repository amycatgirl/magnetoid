import type { Embed, EmbedMedia, EmbedWeb, Message } from "revkit";
import { Component, createSignal, Match, Show, Switch } from "solid-js";
import { For } from "solid-js";
import { Markdown } from "../../../markdown";

interface ComponentProps {
  message: Message;
}

const RevoltEmbeds: Component<ComponentProps> = (props) => {
  const [canLoadIcon, setCanLoadIcon] = createSignal<boolean>(true);
  return (
    <For each={props.message.embeds}>
      {(embed) => (
        <Switch>
          <Match when={embed.isWeb()}>
            <div class='card max-w-md bg-base-200'>
              <Show when={(embed as EmbedWeb).media}>
                <figure>
                  <img src={(embed as EmbedWeb).media.url || ""} />
                </figure>
              </Show>
              <Show
                when={
                  (embed as EmbedWeb).title || (embed as EmbedWeb).description
                }
              >
                <div class={`card-body rounded-bl-2xl break-keep text-neutral`}>
                  <span class='flex items-center gap-2'>
                    <Show when={!canLoadIcon()}>
                      <img
                        src={(embed as EmbedWeb).iconURL || ""}
                        class='w-5'
                        onError={() => setCanLoadIcon(false)}
                      />
                    </Show>
                    <h2 class='text-base-content card-title break-normal'>
                      {(embed as EmbedWeb).title}
                    </h2>
                  </span>
                  <Show when={(embed as EmbedWeb).description}>
                    <p class='text-base-content'>
                      {(embed as EmbedWeb).description || ""}
                    </p>
                  </Show>
                  <Show
                    when={
                      (embed as EmbedWeb).originalURL &&
                      (embed as EmbedWeb).siteName
                    }
                  >
                    <div class='card-actions justify-end'>
                      <a
                        href={(embed as EmbedWeb).originalURL || ""}
                        class='btn btn-primary'
                      >
                        Go to {(embed as EmbedWeb).siteName}
                      </a>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </Match>
          <Match when={embed.isText()}>
            <div class='card w-96 bg-base-200 m:w-auto'>
              <div
                class={`card-body border-2 rounded-2xl text-neutral`}
                style={{
                  "border-color": (embed as Embed).color || "#7ccbff",
                }}
              >
                <h2 class='card-title text-base-content'>
                  {(embed as Embed).title}
                </h2>
                <p class='text-base-content'>
                  {(embed as Embed).description || ""}{" "}
                </p>
              </div>
            </div>
          </Match>
          <Match when={embed.isMedia()}>
            <div class='card w-96 m:w-10 bg-base-100'>
              <figure>
                <img src={(embed as EmbedMedia).url} />
              </figure>
            </div>
          </Match>
        </Switch>
      )}
    </For>
  );
};

export default RevoltEmbeds;
