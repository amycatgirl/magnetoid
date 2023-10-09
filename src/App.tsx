import { Reaction } from "mobx";
import {
  Component, enableExternalSource, Show
} from "solid-js";
import "./styles/main.css";

// Components
import { Login as LoginComponent } from "./components/ui/common/Login";
import { MessageContainer } from "./components/ui/messaging/Message/Container";

// Revolt Client
import { revolt as client } from "./lib/revolt";

// Import signals and stores

import { ChannelSidebar, ServerSidebar, MessageShell } from "./components/ui/navigation/sidebars";
import SidebarStateProvider from "./components/providers/sidebars";
import MessageBox from "./components/ui/messaging/Message/MessageBox";
import Settings from "./components/ui/settings";
import * as Solenoid from "./lib/solenoid";
import MessagesProvider from "./components/providers/messages";
import Home from "./components/ui/common/Home";

// Setup
client.on("ready", async () => {
  Solenoid.setLoggedIn(true);
  Solenoid.setUser("username", client.user?.username);
  Solenoid.setUser("user_id", client.user?.id);
  if (Solenoid.settings.debug && Solenoid.settings.session_type === "token") {
    console.info(`Logged In as ${client.user?.username} (Bot Mode)`);
  } else if (
    Solenoid.settings.debug &&
    Solenoid.settings.session_type === "email"
  ) {
    console.info(`Logged In as ${client.user?.username}`);
  }
});

// Update Status Automatically
client.on("packet", async (info) => {
  if (info.type === "UserUpdate" && info.id === client.user?.id) {
    Solenoid.setSettings("status", info.data.status?.presence);
    Solenoid.setSettings("statusText", info.data.status?.text);
  }
});

// Code is probably no longer needed?
// Maybe I'll switch to a rjs + solenoid monorepo again, who knows -w- 
let id = 0;
enableExternalSource((fn, trigger) => {
  const reaction: any = new Reaction(`externalSource@${++id}`, trigger);
  return {
    track: (x) => {
      let next;
      reaction.track(() => (next = fn(x)));
      return next;
    },
    dispose: () => reaction.dispose(),
  };
});

// TODO: Use routes!

const App: Component = () => {
  return (
    <div class='flex flex-grow-0 flex-col w-full h-screen'>
      <LoginComponent
        client={client}
        userSetter={Solenoid.setUser}
        configSetter={Solenoid.setSettings}
        solenoid_config={Solenoid.settings}
        logged={Solenoid.loggedIn}
        logSetter={Solenoid.setLoggedIn}
      />
      {/* TODO: Make login component more cleaner, current one is a big ass mess */}
      <Show when={Solenoid.loggedIn()}>
        <div class='flex h-full'>
          <MessagesProvider>
            <SidebarStateProvider>
              <ServerSidebar />
              <ChannelSidebar />
            </SidebarStateProvider>
            <MessageShell>
              {/* TODO: Move this into it's own sidebar ig */}
              <Show when={Solenoid.servers.current_channel}>

                <Show when={Solenoid.messages}>
                  <MessageContainer />
                </Show>
                
                <MessageBox />
              </Show>
              <Show when={Solenoid.servers.isHome}>
                <Home />
              </Show>
            </MessageShell>
          </MessagesProvider>
        </div>
      </Show>
      <Show when={Solenoid.settings.show}>
        <Settings />
      </Show>
    </div>
  );
};

export default App;
