import { BaseMessage, Client, Message } from "revolt-toolset";
import {
  Accessor,
  Component,
    createEffect,
  createResource,
  createSignal,
  For,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Markdown } from "../../../markdown";
import RevoltEmbeds from "../embeds";
import { revolt } from "../../../../lib/revolt";
import { ColouredUser } from "../../common/ColouredUser";

dayjs.extend(relativeTime);


const [editing, setEditing] = createSignal<boolean>(false);
const [editMessageId, setEditMessageId] = createSignal<string>();
const [newMessage, setNewMessage] = createSignal<string>();

const [showPicker, setShowPicker] = createSignal<boolean>(false);

const UserMessageBase: Component<{ message: Message }> = (props) => {

  const [replies, setReplies] = createSignal<BaseMessage[] | undefined>();

  createEffect(() => props.message.fetchReplies().then(replies => {
    setReplies(replies);
  }));

  return (

    <Suspense>
    <div>
      <Suspense fallback={<p>Loading replies...</p>}>
      <Show when={replies()}>
        <For each={replies()}>
          {reply => reply.isUser() && (
            <div class="ml-2 my-2 flex gap-2">
              <span>^</span>
              <div class="avatar">
                <div class="w-5 h-5 rounded-full">
                  <img alt={`${reply.author.username}'s profile picture`} src={reply.author.generateAvatarURL() || ""} />
                </div>
              </div>
              <div>
                <ColouredUser message={props.message} />
              </div>
              <div>
                <Markdown content={
                  reply.content.length > 24 &&
                  reply.content.substring(0,24)|| "**No Content**"} />
              </div>
            </div>
          )}
        </For>
      </Show>
      </Suspense>
      <div class="flex gap-2 hover:bg-black/25">
        <div class="ml-2 mr-1 avatar top-3">
          <div class="w-9 h-9 rounded-full">
            <img alt={`${props.message.author?.username}'s profile picture`} src={ props.message.generateMasqAvatarURL() || props.message.member.generateAvatarURL() || props.message.author.generateAvatarURL()} />
          </div>
        </div>
        <div class="my-2 w-full">
          <div>
            <ColouredUser message={props.message} />
          </div>
          <div class="mr-3">
            <Markdown content={props.message.content || ""} />
          </div>
          <Show when={props.message.attachments}>
            <div class="my-2 mr-2">
              <For each={props.message.attachments}>
                {attachment => (
                  <Switch>
                    <Match when={attachment.metadata.type == "Image"}>
                      <img
                        src={attachment.generateURL()}
                        class="max-w-screen-md max-h-96"
                      />
                    </Match>
                    <Match when={attachment.metadata.type === "Video"}>
                      <video
                        src={attachment.generateURL()}
                        class="max-w-64 max-h-64"
                        controls
                      />
                    </Match>
                    <Match when={attachment.metadata.type === "Audio"}>
                      <audio
                        src={attachment.generateURL()}
                        controls
                      />
                    </Match>
                  </Switch>
                )}
              </For>
            </div>
          </Show>
          <Show when={props.message.embeds}>
            <RevoltEmbeds message={props.message} />
          </Show>
        </div>
      </div>
    </div>
      </Suspense>
  );
};

export { UserMessageBase };
