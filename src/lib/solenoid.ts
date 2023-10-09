import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { user, server, reply, settings as config, status } from "../types";
import type { BaseMessage } from "revkit";
import { makePersisted } from "@solid-primitives/storage";

export const [newMessage, setNewMessage] = createSignal<string>("");
export const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
export const [usr, setUser] = makePersisted(
  createStore<user>({
    user_id: undefined,
    username: undefined,
    session_type: undefined,
  }),
  { name: "solenoid:session", storage: localStorage },
);

export const [servers, setServers] = createStore<server>({
  isHome: true,
});

export const [messages, setMessages] = createStore<BaseMessage[]>([]);
export const [replies, setReplies] = createSignal<reply[]>([]);

export const [images, setImages] = createSignal<File[] | null>();
export const [imgUrls, setImgUrls] = createSignal<string[] | null | undefined>(
  [],
);
export const [pickerType, setPickerType] = createSignal<"react" | "emoji">(
  "emoji",
);

// Experimental Server side Nickname Switcher
export const [avatarImage, setAvatarImage] = createSignal<any>();
export const [nickname, setNickname] = createSignal<string>();

// Status Prefabs
export const [newMode, setNewMode] = createSignal<
  "Online" | "Idle" | "Focus" | "Busy" | "Invisible"
>("Online");
export const [newStatus, setNewStatus] = createSignal<string | null>();

// Solenoid Default Settings
export const [settings, setSettings] = makePersisted(
  createStore<config>({
    show: false,
    showSuffix: false,
    suffix: false,
    newShowSuffix: undefined,
    zoomLevel: 5,
    session: undefined,
    session_type: undefined,
    showImages: true,
    debug: false,
    emoji: "mutant",
    experiments: {
      picker: false,
      compact: false,
      nick: false,
      edited_format: "default",
      disappear: false,
    },
  }),
  { name: "solenoid:settings", storage: localStorage },
);

export const [statuslist, setStatusList] = makePersisted(
  createSignal<status[]>([]),
  { name: "solenoid:prefabs", storage: localStorage },
);
// Experimental Emoji Picker
export const [showPicker, setShowPicker] = createSignal<boolean>(false);
