import { css } from "solid-styled-components";
import type { Component } from "solid-js";
import type { Message } from "revolt-toolset";

interface ColouredUserProps {
    message: Message    
}

const ColouredUser: Component<ColouredUserProps> = (props) => {
    return <span
        class={ props.message.member.colorRole && props.message.member.colorRole.color.includes("gradient") ?
                    css`
                    background: ${props.message.member.colorRole.color};
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                  `
                  : css `
                    color: ${props.message.member.colorRole?.color || "inherit"};
                  `
                }>
        {
                    props.message.masquerade?.name
                    || props.message.member?.nickname
                    || props.message.author?.username
                    || "Random Revolt User"
                  }
    </span>
}

export { ColouredUser }