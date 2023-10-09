import { Component, Show, createEffect, createSignal } from "solid-js";
import * as Solenoid from "../../../../lib/solenoid";
import { ulid } from "ulid";
import type { AxiosRequestConfig } from "axios";
import Axios from "axios";
import { revolt } from "../../../../lib/revolt";
import { debounce } from "@solid-primitives/scheduled";
import { BiSolidCog, BiSolidFileImage, BiSolidSend } from "solid-icons/bi";
import { Permissions } from "revkit";
import { AttachmentBar } from "../attachments/attachmentBar";

const [sending, setSending] = createSignal<boolean>(false);

async function uploadFile(
  autummURL: string,
  tag: string,
  file: File,
  config?: AxiosRequestConfig,
) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await Axios.post(`${autummURL}/${tag}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...config,
  });

  return res.data.id;
}

// TODO: MOVE THESE FUNCTIONS TO UTIL
// TODO: REFACTOR
async function sendFile(content: string) {
  const attachments: string[] = [];

  const cancel = Axios.CancelToken.source();
  const files: any | undefined = Solenoid.images();

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      attachments.push(
        await uploadFile(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          revolt.config!.features.autumn.url,
          "attachments",
          file,
          {
            cancelToken: cancel.token,
          },
        ),
      );
      if (Solenoid.settings.debug) console.log(attachments);
    }
  } catch (e) {
    if ((e as any)?.message === "cancel") {
      return;
    } else {
      if (Solenoid.settings.debug) console.log((e as any).message);
    }
  }

  const nonce = ulid();

  try {
    await Solenoid.servers.current_channel?.send({
      content,
      nonce,
      attachments,
      replies: Solenoid.replies(),
    });
  } catch (e: unknown) {
    if (Solenoid.settings.debug) console.log((e as any).message);
  }
}

async function sendMessage(message: string) {
  try {
    setSending(true);
    const nonce = ulid();
    if (Solenoid.servers.current_channel) {
      if (Solenoid.images()) {
        await sendFile(message);
      } else if (Solenoid.replies()) {
        Solenoid.servers.current_channel
          ?.send({
            content: message,
            replies: Solenoid.replies(),
            nonce,
          })
          .catch((e) => {
            throw e;
          });
      } else {
        Solenoid.servers.current_channel
          ?.send({
            content: message,
            nonce,
          })
          .catch((e) => {
            throw e;
          });
      }
    }
    Solenoid.setNewMessage("");
    Solenoid.setReplies([]);
    Solenoid.setImages(undefined);
    Solenoid.setShowPicker(false);
  } catch (err) {
    console.error("Unexpected error while sending message:", err);
  } finally {
    setSending(false);
  }
}

function stopTyping() {
  if (!Solenoid.settings.experiments.disappear)
    revolt.ws.send({
      type: "EndTyping",
      channel: Solenoid.servers.current_channel?.id || "",
    });
}

function startTyping() {
  if (!Solenoid.settings.experiments.disappear)
    revolt.ws.send({
      type: "BeginTyping",
      channel: Solenoid.servers.current_channel?.id || "",
    });
}

const debouncedStopTyping = debounce(() => stopTyping(), 1000);

async function getStatus() {
  const userinfo = await revolt.api.get("/users/@me");
  Solenoid.setSettings("statusText", userinfo.status?.text);
  Solenoid.setSettings("status", userinfo.status?.presence);
}

const MessageBox: Component = () => {
  
  createEffect(() => {
    const newImageUrls: string[] = [];
    (Solenoid.images() as File[])?.forEach((image) =>
      newImageUrls.push(URL.createObjectURL(image)),
    );
    Solenoid.setImgUrls(newImageUrls);
  });

  return (
    <div
      class='sticky left-0 bottom-0 w-full form-control'
    >

      {/* TODO: Move this into the "Userbar" (It should be named messagebox but whatever, issue for future me) component  */}
      <Show when={Solenoid.images() && Solenoid.images()!.length > 0}>
        <AttachmentBar
          setImages={Solenoid.setImages}
          urls={Solenoid.imgUrls()}
        />
      </Show>


      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await sendMessage(Solenoid.newMessage());
        }}
      >
        <div class='flex input-group relative'>
          <button
            class='btn !rounded-none'
            aria-label='Username'
            onClick={async () => {
              if (Solenoid.settings.show) {
                Solenoid.setSettings("show", false);
              } else {
                await getStatus();
                Solenoid.setSettings("show", true);
              }
            }}
            type='button'
            title={`Logged in as ${Solenoid.usr.username}, Click for Settings`}
          >
            <BiSolidCog />
          </button>
          <input
            class='hidden'
            type='file'
            multiple
            name='upload'
            id='files'
            accept='image/png,image/jpeg,image/gif,video/mp4'
            onChange={(e) => Solenoid.setImages([...e.target.files!])}
          />
          <label
            for='files'
            role='button'
            class='btn !rounded-none'
          >
            <BiSolidFileImage />
          </label>
          <input
            class='w-full input bg-base-300 resize-none'
            title='Message'
            placeholder={
              !Solenoid.servers.current_channel?.permissions.has(
                Permissions.SendMessage,
              )
                ? "mf you don't have permission to send messages"
                : `Message`
            }
            value={Solenoid.newMessage()}
            onChange={(e: any) => {
              Solenoid.setNewMessage(e.currentTarget.value);
            }}
            onInput={() => {
              startTyping();
            }}
            onKeyDown={async () => {
              debouncedStopTyping();
            }}
            maxlength={2000}
            disabled={
              !Solenoid.servers.current_channel?.permissions.has(
                Permissions.SendMessage,
              )
            }
            autofocus
          />
          <button
            class='btn !rounded-none'
            classList={{
              "btn-disabled": sending(),
            }}
            aria-label='Send'
            disabled={sending()}
            type='submit'
          >
            <BiSolidSend />
          </button>
        </div>
      </form>

    </div>
  );
};

export default MessageBox;