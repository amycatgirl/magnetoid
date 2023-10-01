import { SystemMessage, SystemMessageType, SystemMessageDetail } from "revkit";
import { Switch, type Component, Match } from "solid-js";
import { Markdown } from "../../../markdown";
const SystemMessageBase: Component<{ sysmessage: SystemMessage }> = (props) => {
  return (
    <Switch>
      <Match
        when={props.sysmessage.detail.type === SystemMessageType.UserJoined}
      >
        <div class='flex items-center gap-2'>
          <div class='w-10 h-10'>
            <img
              class='avatar rounded-lg'
              src='/system.webp'
            />
          </div>
          <div class='flex flex-col gap-2'>
            <div>
              <span class='font-semibold'>System</span>
            </div>
            <div>
              <Markdown
                content={`:01GJTC4RD6XAJXRAAM30KW25VD: | Hello, ${
                  (
                    props.sysmessage.detail as Extract<
                      SystemMessageDetail,
                      { type: SystemMessageType.UserJoined }
                    >
                  ).user.username
                }!`}
              />
            </div>
          </div>
        </div>
      </Match>
      <Match when={props.sysmessage.detail.type === SystemMessageType.UserLeft}>
        <div class='flex items-center gap-2'>
          <div class='w-10 h-10'>
            <img
              class='avatar rounded-lg'
              src='/system.webp'
            />
          </div>
          <div class='flex flex-col gap-2'>
            <div>
              <span class='font-semibold'>System</span>
            </div>
            <div>
              <Markdown
                content={`:01GJTC4RD6XAJXRAAM30KW25VD: | Bye, ${
                  (
                    props.sysmessage.detail as Extract<
                      SystemMessageDetail,
                      { type: SystemMessageType.UserLeft }
                    >
                  ).user.username
                }!`}
              />
            </div>
          </div>
        </div>
      </Match>
      <Match
        when={props.sysmessage.detail.type === SystemMessageType.UserKicked}
      >
        <div class='flex items-center gap-2'>
          <div class='w-10 h-10'>
            <img
              class='avatar rounded-lg'
              src='/system.webp'
            />
          </div>
          <div class='flex flex-col gap-2'>
            <div>
              <span class='font-semibold'>System</span>
            </div>
            <div>
              <Markdown
                content={`:01GJTC4RD6XAJXRAAM30KW25VD: | ${
                  (
                    props.sysmessage.detail as Extract<
                      SystemMessageDetail,
                      { type: SystemMessageType.UserJoined }
                    >
                  ).user.username
                } was ejected because he was too suspicious`}
              />
            </div>
          </div>
        </div>
      </Match>
      <Match
        when={props.sysmessage.detail.type === SystemMessageType.UserBanned}
      >
        <div class='flex items-center gap-2'>
          <div class='w-10 h-10'>
            <img
              class='avatar rounded-lg'
              src='/system.webp'
            />
          </div>
          <div class='flex flex-col gap-2'>
            <div>
              <span class='font-semibold'>System</span>
            </div>
            <div>
              <Markdown
                content={`:01GJTC4RD6XAJXRAAM30KW25VD: | ${
                  (
                    props.sysmessage.detail as Extract<
                      SystemMessageDetail,
                      { type: SystemMessageType.UserBanned }
                    >
                  ).user.username
                } was struck by the ban hammer`}
              />
            </div>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

export { SystemMessageBase };
