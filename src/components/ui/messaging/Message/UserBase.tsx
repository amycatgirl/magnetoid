import { BaseMessage, Client, Message } from "revkit";
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
import { ColouredUser } from "../../common/ColouredUser";
import { settings } from "../../../../lib/solenoid";

dayjs.extend(relativeTime);

const UserMessageBase: Component<{ message: Message }> = (props) => {
  const [replies, setReplies] = createSignal<BaseMessage[] | undefined>();

  createEffect(() =>
    props.message.fetchReplies().then((replies) => {
      setReplies(replies);
    }),
  );

  return (
    <Suspense fallback={<p>loading</p>}>
      <div>
        <Suspense fallback={<p>Loading replies...</p>}>
          <Show when={replies()}>
            <For each={replies()}>
              {(reply) =>
                reply.isUser() && (
                  <div class='ml-2 my-2 flex gap-2 max-h-20'>
                    <span>^</span>
                    <div class='avatar'>
                      <div class='w-5 h-5 rounded-full'>
                        <img
                          alt={`${reply.author.tag}'s profile picture`}
                          src={reply.author.generateAvatarURL() || ""}
                          loading='lazy'
                        />
                      </div>
                    </div>
                    <div>
                      <ColouredUser message={reply} />
                    </div>
                    <div>
                      <p class='truncate max-w-sm'>
                        {reply.content ?? "**No Content**"}
                      </p>
                    </div>
                  </div>
                )
              }
            </For>
          </Show>
        </Suspense>
        <div class='flex gap-2 hover:bg-black/25'>
          <div class='ml-2 mr-1 avatar top-3'>
            <div class='w-9 h-9 rounded-full'>
              <img
                alt={`${props.message.author?.username}'s profile picture`}
                src={
                  props.message.generateMasqAvatarURL() ||
                  props.message.member.generateAvatarURL() ||
                  props.message.author.generateAvatarURL()
                }
              />
            </div>
          </div>
          <div class='my-2 w-full'>
            <div>
              <ColouredUser message={props.message} />
            </div>
            <div class='mr-3'>
              <Markdown content={props.message.content || ""} />
            </div>
            <Show when={props.message.attachments && settings.showImages}>
              <div class='my-2 mr-2 h-auto'>
                <For each={props.message.attachments}>
                  {(attachment) => (
                    <Switch>
                      <Match when={attachment.metadata.type == "Image"}>
                        <img
                          src={attachment.generateURL()}
                          loading='lazy'
                          class='max-w-[400px] h-auto'
                        />
                      </Match>
                      <Match when={attachment.metadata.type === "Video"}>
                        <video
                          src={attachment.generateURL()}
                          class='max-w-64 max-h-64'
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
