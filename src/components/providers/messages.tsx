import { Component, JSX, createContext, useContext } from "solid-js";
import { type BaseMessage } from "revkit";
import { createStore, SetStoreFunction } from "solid-js/store";

type MessageContext = [BaseMessage[], SetStoreFunction<BaseMessage[]>];

const MessageContext = createContext<MessageContext>();

const MessagesProvider: Component<{ children: JSX.Element }> = (props) => {
  const [messages, setMessages] = createStore<BaseMessage[]>([]);

  return (
    <MessageContext.Provider value={[messages, setMessages]}>
      {props.children}
    </MessageContext.Provider>
  );
};

const useMessages = () => {
  const context = useContext(MessageContext);

  if (!context) throw "Can't find context, sorry ;w;"

  return context
}


export default MessagesProvider;
export { useMessages };