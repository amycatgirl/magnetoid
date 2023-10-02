import {
  Component,
  createSignal,
  Setter,
  Accessor,
  batch,
  onMount,
  Show,
} from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import type { user, settings } from "../../../../types";
import type { Client } from "revkit";
import { setSettings } from "../../../../lib/solenoid";
import { revolt } from "../../../../lib/revolt";

interface LoginComponent {
  client: Client;
  userSetter: SetStoreFunction<user>;
  logSetter: Setter<boolean>;
  logged: Accessor<boolean>;
  configSetter: SetStoreFunction<settings>;
  solenoid_config: settings;
}
const [token, setToken] = createSignal<string>();
const [email, setEmail] = createSignal<string>();
const [password, setPassword] = createSignal<string>();
const [error, setError] = createSignal<string>();

const Login: Component<LoginComponent> = (props) => {
  // Functions
  // Login With Token and Enable Bot Mode
  async function logIntoRevolt(token: string) {
    try {
      await props.client.login(token, "bot");
      props.logSetter(true);
      props.userSetter("session_type", "token");
      props.configSetter("session", props.client.session);
    } catch (e: any) {
      if (props.solenoid_config.debug) {
        console.log(e);
        setError(e);
      } else {
        alert(e);
        setError(e);
      }
    }
  }

  // Login With Email and Password and Enable User Mode
  async function loginWithEmail(email: string, password: string) {
    try {
      await props.client
        .authenticate({
          email: email,
          password: password,
          friendly_name: "Solenoid Client",
        })
        .catch((e) => {
          throw e;
        });
      batch(() => {
        props.logSetter(true);
        props.userSetter("session_type", "email");
        props.configSetter("session", props.client.session);
      });
    } catch (e: any) {
      if (props.solenoid_config.debug) {
        console.log(e);
      }
      setError(e);
    }
  }
  async function loginWithSession(
    session: unknown & { action: "LOGIN"; token: string },
  ) {
    try {
      await props.client.login(session.token, "user").catch((e) => {
        throw e;
      });
      batch(() => {
        props.configSetter("session_type", "email");
        props.configSetter("session", session);
        props.logSetter(true);
      });
    } catch (e: any) {
      setError(e);
    }
  }

  onMount(async () => {
    if (props.solenoid_config.session) {
      await loginWithSession(props.solenoid_config.session);
    }
  });

  return (
    <>
      <Show when={!props.logged()}>
        <>
          <div class='lg:absolute lg:w-1/3 lg:h-auto flex flex-col h-full w-full shadow-none lg:top-36 lg:left-6 md:sm:bg-base-100 lg:bg-base-300/60 backdrop-blur-xl'>
            <div class='mx-10 my-10 flex items-center gap-2'>
              <div class='w-10'>
                <img
                  alt="Magnetoid's icon"
                  src='/favicon.png'
                />
              </div>
              <div class='prose'>
                <h1>Magnetoid</h1>
              </div>
              <div class='prose self-start'>
                <Show when={window.location.hostname.includes("localhost")}>
                  <h5>local</h5>
                </Show>
              </div>
            </div>
            <form
              class='mx-10'
              onSubmit={async (e) => {
                e.preventDefault();
                if (email() && password()) {
                  try {
                    await loginWithEmail(email() ?? "", password() ?? "").catch(
                      (e) => {
                        throw e;
                      },
                    );
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
            >
              <div class='sm:w-full'>
                <div class='prose m-2'>
                  <h3>Login with Email</h3>
                </div>
                <div class='flex flex-col'>
                  <input
                    class='input input-bordered w-full my-2'
                    id='email'
                    type='email'
                    placeholder='Email'
                    value={email() || ""}
                    onInput={(e: any) => setEmail(e.currentTarget.value)}
                  />
                  <input
                    class='input input-bordered w-full my-2'
                    id='password'
                    type='password'
                    placeholder='Password'
                    value={password() || ""}
                    onInput={(e: any) => setPassword(e.currentTarget.value)}
                  />
                  <input
                    class='input w-full my-2'
                    id='mfa'
                    type='text'
                    placeholder='2fa Token (Optional, Not yet implemented)'
                    disabled
                  />
                  <button
                    class='btn w-full my-2'
                    id='submit'
                    type='submit'
                  >
                    Login with Email
                  </button>
                </div>

                {error() && (
                  <span class='solenoid-error'>
                    An error has occurred while logging in: {error()}
                  </span>
                )}
              </div>
            </form>

            <form
              class='mx-10'
              onSubmit={async (e) => {
                e.preventDefault();
                await logIntoRevolt(token() ?? "");
              }}
            >
              <div class='flex flex-col'>
                <div class='prose m-2'>
                  <h3 id='subtitle'>Login with Token</h3>
                </div>
                <div class='flex flex-col'>
                  <input
                    id='token'
                    type='text'
                    class='input input-bordered w-full my-2'
                    placeholder='Token'
                    value={token() || ""}
                    onInput={(e: any) => setToken(e.currentTarget.value)}
                  />
                  <button
                    class='btn w-full my-2'
                    id='submit'
                    type='submit'
                  >
                    Login
                  </button>
                </div>
              </div>
            </form>
            {props.solenoid_config.session && (
              <div class='flex flex-col w-full items-center gap-2'>
                <button
                  class='btn btn-success w-60'
                  onClick={() =>
                    loginWithSession(props.solenoid_config.session)
                  }
                >
                  {revolt.ws.ready ? "Loading..." : "Use Existing Session"}
                </button>
                <button
                  class='btn btn-error w-60'
                  onClick={() => {
                    setSettings("session", undefined);
                    if (revolt.ws.ready) {
                      revolt.ws.disconnect();
                    }
                  }}
                >
                  Remove last session
                </button>
              </div>
            )}
          </div>
          <div>
            <div class='hidden lg:block lg:absolute lg:bottom-10 lg:right-10 text-white'>
              Photo by{" "}
              <a href='https://unsplash.com/@pramodtiwari?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText'>
                Pramod Tiwari
              </a>{" "}
              on{" "}
              <a href='https://unsplash.com/photos/a-close-up-of-a-cell-phone-with-a-blurry-background-2JMKvS2qT9c?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText'>
                Unsplash
              </a>
            </div>
            <img
              class='hidden lg:block lg:h-screen lg:w-screen lg:-z-10'
              src='/wallpapers/pramod-tiwari-unsplash.jpg'
            />
          </div>
        </>
      </Show>
    </>
  );
};

export { Login };
