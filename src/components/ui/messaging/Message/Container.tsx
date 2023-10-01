import { UserMessageBase } from "./UserBase";
import { For, createEffect, onCleanup } from "solid-js";
import { messages, servers, setMessages } from "../../../../lib/solenoid";

import type { Component } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { SystemMessageBase } from "./SystemBase";

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
          return (
            <div>
              <SystemMessageBase sysmessage={message} />
            </div>
          );
        } else if (message?.isUser()) {
          return (
            <div>
              <UserMessageBase message={message} />
            </div>
          );
        }
      }}
    </For>
  );
};

export { MessageContainer };
