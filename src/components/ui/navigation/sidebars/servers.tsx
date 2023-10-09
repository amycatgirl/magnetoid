import { Component, Match, Switch } from "solid-js";
import type { Server } from "revkit";
import { createSignal, For } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { setServers, servers } from "../../../../lib/solenoid";
import { BiSolidHome } from "solid-icons/bi";
import { useMessages } from "../../../providers/messages";
import { useSidebarState } from "../../../providers/sidebars";

const Navigation: Component = () => {

  const [state, setState] = useSidebarState();
  const [, setMessages] = useMessages();
  const [serverlist, setServerList] = createSignal<Server[]>([]);

  setServerList(revolt.servers.items());
  return (
    <div classList={
      {
        "hidden": state.server === "hidden"
      }
    } class='w-full max-w-min px-3 flex flex-col'>
      <button
        onClick={() => {
          // TODO: Make this a bit clearer
          setServers("current_server", undefined);
          setServers("current_channel", undefined);
          // TODO: Clear messages on component unmount
          setMessages([]);
          setServers("isHome", true);
        }}
        class='btn btn-circle my-2 w-12 h-auto'
        classList={{
          "btn-active": servers.isHome,
        }}
      >
        <BiSolidHome />
      </button>
      <For each={serverlist()}>
        {(server) => (
          <button
            class='my-2 btn btn-circle flex align-center justify-center'
            classList={{
              "btn-active": servers.current_server === server,
            }}
            onClick={() => {
              setServers("current_server", server);
              setServers("isHome", false);
            }}
          >
            <Switch>
              <Match when={server.icon}>
                <div class='avatar'>
                  <div class='w-full h-full rounded-full'>
                    <img
                      alt={`${server.name}'s icon`}
                      src={server.generateIconURL()}
                    />
                  </div>
                </div>
              </Match>
              <Match when={!server.icon}>
                <div class='avatar placeholder'>
                  <div class='w-12 h-12 bg-neutral-focus font-bold rounded-full'>
                    <span>{server.name[0]}</span>
                  </div>
                </div>
              </Match>
            </Switch>
          </button>
        )}
      </For>
    </div>
  );
};

export default Navigation;

