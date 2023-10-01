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
import ChannelNavigation from "./components/ui/navigation/navbar/channels";
import Navigation from "./components/ui/navigation/navbar/servers";
import Userbar from "./components/ui/navigation/Userbar";
import Settings from "./components/ui/settings";
import * as Solenoid from "./lib/solenoid";

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

// Mobx magic (Thanks Insert :D)
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
  // Image Attaching
  createEffect(() => {
    const newImageUrls: any[] = [];
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
      <Show when={Solenoid.loggedIn()}>
        <div class='flex h-full'>
          <Navigation />
          <Show when={Solenoid.servers.current_server}>
            <ChannelNavigation />
          </Show>
          <div class='container block w-full overflow-y-scroll'>
            {Solenoid.servers.isHome && (
              <div class='home'>
                <h1>Solenoid (Beta)</h1>
                {window.location.hostname === "localhost" && (
                  <h3>Running on Local Server</h3>
                )}
                <p>A lightweight client for revolt.chat made with SolidJS</p>
                <br />
                <h3>Contributors</h3>
                <hr />
                <p>Insert: Helped me with Mobx and Revolt.js issues</p>
                <p>
                  RyanSolid:{" "}
                  <a href='https://codesandbox.io/s/mobx-external-source-0vf2l?file=/index.js'>
                    This
                  </a>{" "}
                  code snippet
                </p>
                <p>
                  VeiledProduct80: Help me realize i forgot the masquerade part
                </p>
                <p>
                  Mclnooted: <b>sex</b>
                </p>
              </div>
            )}
            <div>
              <Show when={Solenoid.messages()}>
                <MessageContainer />
              </Show>
              <Show when={Solenoid.servers.current_channel}>
                <Show when={Solenoid.images() && Solenoid.images()!.length > 0}>
                  <div class='sticky bottom-12 flex gap-4 w-full max-h-auto bg-base-200 p-4 overflow-x-scroll'>
                    <For each={Solenoid.imgUrls()}>
                      {(img, index) => (
                        <div
                          class='hover:brightness-50 transition-all ease-in-out'
                          onClick={() => {
                            Solenoid.setImages((prev) =>
                              (prev as File[]).filter(
                                (_, imgIndex) => index() !== imgIndex,
                              ),
                            );
                          }}
                        >
                          <img
                            class='max-w-48 max-h-48 rounded-md'
                            src={img}
                            loading='lazy'
                          />
                        </div>
                      )}
                    </For>
                    <div
                      class='self-center btn btn-error'
                      onClick={() => Solenoid.setImages(null)}
                    >
                      <p>Remove all attachments</p>
                    </div>
                  </div>
                </Show>
                <Userbar />
              </Show>
            </div>
          </div>
        </div>
      </Show>
      <Show when={Solenoid.settings.show}>
        <Settings />
      </Show>
    </div>
  );
};

export default App;
