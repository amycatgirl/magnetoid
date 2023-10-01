import { Component, For, Setter } from "solid-js";

interface AttachmentBarProps {
  urls: string[];
  setImages: Setter<File[] | null | undefined>;
}

const AttachmentBar: Component<AttachmentBarProps> = (props) => {
  return (
    <div class='sticky bottom-12 flex gap-4 w-full max-h-auto bg-base-200 p-4 overflow-x-scroll'>
      <For each={props.urls}>
        {(img, index) => (
          <div
            class='hover:brightness-50 transition-all ease-in-out'
            onClick={() => {
              props.setImages((prev: File[] | null | undefined) =>
                (prev as File[]).filter((_, imgIndex) => index() !== imgIndex),
              );
            }}
          >
            <img
              class='max-w-48 max-h-48 rounded-md'
              src={img}
              loading='lazy'
            />
          </div>
        )}
      </For>
      <div
        class='self-center btn btn-error'
        onClick={() => props.setImages(null)}
      >
        <p>Remove all attachments</p>
      </div>
    </div>
  );
};

export { AttachmentBar };
