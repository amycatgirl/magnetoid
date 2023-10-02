import { styled } from "solid-styled-components";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";
import { revolt } from "../../../lib/revolt";
import type { Component } from "solid-js";

const Mention = styled.a`
  gap: 4px;
  flex-shrink: 0;
  padding-left: 2px;
  padding-right: 6px;
  align-items: center;
  display: inline-flex;
  vertical-align: middle;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none !important;
  transition: 0.1s ease filter;
  &:hover {
    filter: brightness(0.75);
  }
  &:active {
    filter: brightness(0.65);
  }
  svg {
    width: 1em;
    height: 1em;
  }
`;

const RE_MENTIONS = /<@([0-9ABCDEFGHJKMNPQRSTVWXYZ]{26})>/g;

const RenderMention: Component<CustomComponentProps> = (props) =>  {

  const user = revolt.users.get(props.match)!;
  return (
    <Mention class="bg-base-300 rounded-full h-max w-max">
      <div class="rounded-full flex w-full items-center gap-2">
          <img
            src={
              user.generateAvatarURL()
            }
            class="w-5 h-5 rounded-full"
          />
          @{user.tag}
        </div>
    </Mention>
  );
}

export const remarkMention = createComponent("mention", RE_MENTIONS, (match: any) =>
  revolt.users.has(match)
);

export {RenderMention}