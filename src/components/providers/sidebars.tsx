
import { Component, JSX, createContext, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

interface States {
    server: "shown" | "hidden";
    channel: "shown" | "hidden";
}

type SidebarStateContext = [States, SetStoreFunction<States>];

const SidebarStateContext = createContext<SidebarStateContext>();

const SidebarStateProvider: Component<{ children: JSX.Element }> = (props) => {
  const [state, setState] = createStore<States>({
    server: "shown",
    channel: "shown"
  });

  return (
    <SidebarStateContext.Provider value={[state, setState]}>
      {props.children}
    </SidebarStateContext.Provider>
  );
};

const useSidebarState = () => {
  const context = useContext(SidebarStateContext);

  if (!context) throw "Can't find context, sorry ;w;"

  return context
}


export default SidebarStateProvider;
export { useSidebarState };