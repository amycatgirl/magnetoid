import { BaseMessage, Client, Message } from "revkit";
import {
    Accessor,
    Component,
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    from,
    lazy,
    Match, onCleanup,
    Show,
    splitProps,
    Suspense,
    Switch,
} from "solid-js";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Markdown } from "../../../markdown";
import RevoltEmbeds from "../embeds";
import { ColouredUser } from "../../common/ColouredUser";
import { settings } from "../../../../lib/solenoid";
import { revolt } from "../../../../lib/revolt";
import {trackDeep} from "@solid-primitives/deep";

const Reaction = lazy(() => import("../attachments/reaction"));

dayjs.extend(relativeTime);

const UserMessageBase: Component<{ message: Message }> = (props) => {
  const [local, _] = splitProps(props, ["message"]);

  const [replies] = createResource(async () => local.message.fetchReplies());

  const avatar = (m: Message) =>
    m.generateMasqAvatarURL() ||
    m.member?.generateAvatarURL() ||
    m.author.generateAvatarURL() ||
    m.author.defaultAvatarURL;


  const pfp = createMemo(() => avatar(local.message));

  const message = () => trackDeep(local.message);

  createEffect(() => {
    trackDeep(local.message);
    console.log(message);
  })


  return (
    <Suspense fallback={<p>loading</p>}>
      <div>
        <Show
          when={!replies.loading}
          fallback={<p>Loading replies...</p>}
        >
          <Show when={replies()}>
            <For each={replies()}>
              {(reply) => {
                if (reply.isSystem()) return;
                if (reply.isUser()) {
                  const replyPFP = createMemo(() => avatar(reply));
                  return (
                    reply.isUser() && (
                      <div class='ml-2 my-2 flex gap-2 max-h-20'>
                        <span>^</span>
                        <div class='avatar'>
                          <div class='w-5 h-5 rounded-full'>
                            <img
                              alt={`${reply.author.username}'s profile picture`}
                              src={replyPFP() || ""}
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
                  );
                }
              }}
            </For>
          </Show>
        </Show>
        <div class='flex gap-2 hover:bg-black/25'>
          <div class='ml-2 mr-1 avatar top-3'>
            <div class='w-9 h-9 rounded-full'>
              <img
                alt={`${message().author?.username}'s profile picture`}
                src={pfp()}
              />
            </div>
          </div>
          <div class='my-2 w-full'>
            <div>
              <ColouredUser message={message()} />
            </div>
            <div class='mr-3'>
              <Markdown content={message().content || ""} />
            </div>
            <Show when={message().attachments && settings.showImages}>
              <div class='my-2 mr-2 h-auto'>
                <For each={message().attachments}>
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
            <Show when={message().embeds}>
              <RevoltEmbeds message={message()} />
            </Show>
            <div class='mt-1 flex gap-x-3'>
              <For each={message().reactions}>
                {(reaction) => (
                  <Show when={typeof reaction !== "undefined"}>
                    <Reaction
                      onClick={() => {
                        !reaction.userIDs.includes(revolt.user.id)
                          ? message().react(reaction.emoji)
                          : message().unreact(reaction.emoji);
                      }}
                      reaction={() => reaction}
                      active={reaction.userIDs.includes(revolt.user.id)}
                    />
                  </Show>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default UserMessageBase;
