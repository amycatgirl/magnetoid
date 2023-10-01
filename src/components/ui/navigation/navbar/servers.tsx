import { Component, Match, Switch } from "solid-js";
import type { Server } from "revkit";
import { createSignal, For } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { setServers, servers } from "../../../../lib/solenoid";
import classNames from "classnames";
import { BiSolidHome } from "solid-icons/bi";

const [serverlist, setServerList] = createSignal<Server[]>([]);

const Navigation: Component = () => {
  setServerList(revolt.servers.items());
  return (
    <div class='flex flex-col h-screen bg-base-300 px-4'>
      <button
        onClick={() => {
          setServers("current_server", undefined);
          setServers("current_channel", undefined);
          setServers("isHome", true);
        }}
        class='btn btn-circle my-2 w-full h-auto'
        classList={{
          "btn-active": servers.isHome,
        }}
      >
        <BiSolidHome />
      </button>
      <For each={serverlist()}>
        {(server) => (
          <button
            class='my-2 btn btn-circle'
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
                  <div class='w-12 h-12 rounded-full'>
                    <img src={server.generateIconURL()} />
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
