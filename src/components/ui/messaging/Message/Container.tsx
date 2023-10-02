import {
  For,
  Switch,
  createEffect,
  onCleanup,
  Match,
  Suspense,
  lazy,
} from "solid-js";
import { messages, servers, setMessages } from "../../../../lib/solenoid";

import type { Component } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { SystemMessageBase } from "./SystemBase";

const UserMessageBase = lazy(() => import("./UserBase"));
const MessageContainer: Component = () => {
  createEffect(() => {
    revolt.on(
      "message",
      async (m) =>
        m.channelID === servers.current_channel?.id &&
        setMessages((old) => [...(old ?? []), m]),
    );

    onCleanup(() => revolt.removeListener("message"));
  });

  return (
    <For each={messages()}>
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
  );
};

export { MessageContainer };
