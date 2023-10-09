import { Reaction } from "mobx";
import {
  batch,
  Component,
  createEffect,
  enableExternalSource,
  For,
  onCleanup,
  Show,
} from "solid-js";
import "./styles/main.css";

// Components
import { Login as LoginComponent } from "./components/ui/common/Login";
import { MessageContainer } from "./components/ui/messaging/Message/Container";

// Revolt Client
import { revolt as client } from "./lib/revolt";

// Import signals and stores
import ChannelNavigation from "./components/ui/navigation/sidebars/channels";
import Navigation from "./components/ui/navigation/sidebars/servers";
import Userbar from "./components/ui/navigation/Userbar";
import Settings from "./components/ui/settings";
import * as Solenoid from "./lib/solenoid";
import { AttachmentBar } from "./components/ui/messaging/attachments/attachmentBar";
import MessagesProvider from "./components/providers/messages";
import Home from "./components/ui/common/Home";
import SidebarStateProvider from "./components/providers/sidebars";
import { Portal } from "solid-js/web";
import { MessageShell } from "./components/ui/navigation/sidebars";

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

const App: Component = () => {
  // TODO: Move this into the messagebox component
  createEffect(() => {
    const newImageUrls: string[] = [];
    (Solenoid.images() as File[])?.forEach((image) =>
      newImageUrls.push(URL.createObjectURL(image)),
    );
    Solenoid.setImgUrls(newImageUrls);
  });

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
              <Navigation />
              <ChannelNavigation />
            </SidebarStateProvider>
            <MessageShell>
              {/* TODO: Move this into it's own sidebar ig */}
              <Show when={Solenoid.servers.current_channel}>

                <Show when={Solenoid.messages}>
                  <MessageContainer />
                </Show>
                {/* TODO: Move this into the "Userbar" (It should be named messagebox but whatever, issue for future me) component  */}
                <Show when={Solenoid.images() && Solenoid.images()!.length > 0}>
                  <AttachmentBar
                    setImages={Solenoid.setImages}
                    urls={Solenoid.imgUrls()}
                  />
                </Show>

                <Userbar />
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
