import {
  type Component,
  type Accessor,
  Show,
  createSignal,
  splitProps,
} from "solid-js";
import { Message, User } from "revkit";
import { revolt } from "../../../../lib/revolt";
import { createResource } from "solid-js";

type Reaction = {
  emoji: string;
  userIDs: string[];
  users: User[];
};

interface ReactionProps {
  reaction: Accessor<Reaction>;
  onClick: () => void;
  active: boolean;
}

const Reaction: Component<ReactionProps> = (props) => {
  const [local] = splitProps(props, ["reaction", "onClick", "active"]);

  const [emoji] = createResource(
    async () => await revolt.emojis.fetch(local.reaction().emoji, true),
  );
  return (
    <div
      onClick={() => local.onClick()}
      class='flex items-center justify-center flex-shrink-0 w-14 rounded-md bg-neutral p-2 gap-2'
      classList={{
        "border-2 border-accent": local.active,
        "cursor-pointer": !local.active,
      }}
    >
      <div class='block w-14 h-auto'>
        <Show fallback={<p>{local.reaction().emoji}</p>} when={!emoji.loading && emoji()  }>
          <img
            src={emoji()?.imageURL}
            width={56}
            alt={emoji()?.uniqueName}
          />
        </Show>
      </div>
      <p>{local.reaction().users.length}</p>
    </div>
  );
};

export default Reaction;
export type { Reaction };
