import type { Component, JSX } from "solid-js";

const MessageShell: Component<{ children: JSX.Element }> = (props) => {
    return <div class='w-full h-screen overflow-y-scroll'>
        {props.children}
    </div>

}

export default MessageShell