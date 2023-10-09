import {
  For,
  Switch,
  createEffect,
  onCleanup,
  Match,
  Suspense,
  lazy,
  onMount,
  Show,
} from "solid-js";
import { servers, } from "../../../../lib/solenoid";

import type { Component } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { SystemMessageBase } from "./SystemBase";
import { createStore, produce } from "solid-js/store";
import { Message } from "revkit";
import { trackStore } from "@solid-primitives/deep";
import { useMessages } from "../../../providers/messages";

const UserMessageBase = lazy(() => import("./UserBase"));
const MessageContainer: Component = () => {
  const [messages, setMessages] = useMessages();

  createEffect(() => {
    onMount(() => {
      revolt.on(
        "message",
        async (m) =>
          m.channelID === servers.current_channel?.id &&
          setMessages((old) => [...(old ?? []), m]),
      );

      revolt.on("messageUpdate", (new_message) => {
        if (new_message.channelID !== servers.current_channel?.id) return;
        setMessages(
          [
            ...(messages.map((message) =>
              message === new_message ? new_message : message,
            ))
          ])
      },
      );
    });

    onCleanup(() => {
      revolt.removeListener("message");
      revolt.removeListener("messageUpdate");
    });
  });

  return (
    <Show when={servers.current_channel}>
      <For each={messages}>
        {(message) => {
          if (message?.isSystem()) {
            return <SystemMessageBase sysmessage={message} />;
          } else if (message?.isUser()) {
            return (
              <Switch>
                <Match when={message.author.relationship !== "Blocked"}>
                  <Suspense fallback={<p>loading...</p>}>
                    <UserMessageBase message={message} />
                  </Suspense>
                </Match>
                <Match when={message.author.relationship === "Blocked"}>
                  <p>x Blocked message</p>
                </Match>
              </Switch>
            );
          }
        }}
      </For>
    </Show>
  );
};

export { MessageContainer };
