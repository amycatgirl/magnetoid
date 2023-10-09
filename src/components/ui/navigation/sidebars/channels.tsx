import { Component, For, Show, batch } from "solid-js";
import * as Solenoid from "../../../../lib/solenoid";
import { Markdown } from "../../../markdown";
import { useMessages } from "../../../providers/messages";
import { useSidebarState } from "../../../providers/sidebars";

const ChannelNavigation: Component = () => {

  const [messages, setMessages] = useMessages();
  const [state, setState] = useSidebarState();

  async function getMessagesFromChannel() {
    // TODO: Make a resource out of this
    await Solenoid.servers.current_channel?.messages
      .fetchMultiple({ include_users: true })
      .then((messages) => setMessages(messages.reverse()));
    Solenoid.setServers("isHome", false);
  }

  return (
    <div class='w-full h-screen bg-base-200 max-w-md px-4 overflow-y-scroll overflow-x-hidden'>
      <div>
        <button onClick={() => state.server === "shown" ? setState("server", "hidden") : setState("server", "shown")}>Show Servers</button>
      </div>
      <div class='prose py-2'>
        <h2>{Solenoid.servers.current_server?.name}</h2>
      </div>
      <For each={Solenoid.servers.current_server?.orderedChannels}>
        {(category) => (
          <details open>
            <summary class='font-semibold m-2'>{category.name}</summary>
            <div class='flex flex-col gap-3'>
              <For each={category.channels}>
                {(channel) => (
                  <button
                    class='w-full h-auto rounded-md items-center p-2 flex gap-2'
                    classList={{
                      "text-base-content":
                        channel.id !== Solenoid.servers.current_channel?.id,
                      "text-accent-content":
                        channel.id === Solenoid.servers.current_channel?.id,
                      "bg-base-300":
                        channel.id !== Solenoid.servers.current_channel?.id,
                      "btn-accent":
                        channel.id === Solenoid.servers.current_channel?.id,
                    }}
                    onClick={async () => {
                      batch(() => {
                        Solenoid.setServers("current_channel", channel);
                        setMessages([]);
                      });

                      channel.ack();

                      await getMessagesFromChannel();
                    }}
                  >
                    <Markdown content={channel.name} />
                    <Show when={channel.unread}>
                      <div
                        class='w-2 h-2 ml-auto mr-2 rounded-full '
                        classList={{
                          "bg-accent-content":
                            channel.id === Solenoid.servers.current_channel?.id,
                          "bg-base-content":
                            channel.id !== Solenoid.servers.current_channel?.id,
                        }}
                      />
                    </Show>
                  </button>
                )}
              </For>
            </div>
          </details>
        )}
      </For>
    </div>
  );
};

export default ChannelNavigation;