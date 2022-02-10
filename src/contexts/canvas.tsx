import { createContext, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { events } from '@events/index';
import { Blocks, CanvasContent, Events } from 'types';

import { defaultBlocksProps } from 'config';
type HandleAddContentArgs = CustomEvent<Blocks>;

type CanvasContextData = {
  contents: CanvasContent[];
  currentContent?: CanvasContent;
};

type CanvasProviderProps = {
  children: React.ReactNode;
};

const CanvasContext = createContext<CanvasContextData>({} as CanvasContextData);

const CanvasProvider = ({ children }: CanvasProviderProps) => {
  const [contents, setContents] = useState<CanvasContent[]>([]);
  const [currentContent, setCurrentContent] = useState<CanvasContent>();

  const handleAddContent = (event: HandleAddContentArgs) => {
    const blockType = event.detail;
    const defaultProps = defaultBlocksProps[blockType];

    const newContent = {
      id: uuid(),
      type: event.detail,
      ...defaultProps,
    };

    setContents(state => [...state, newContent]);
  };

  const handleRemoveContent = (event: CustomEvent<string>) => {
    setContents(state => state.filter(item => item.id !== event.detail));
  };

  const handleSetCurrentContent = (event: CustomEvent<string>) => {
    const id = event.detail;

    const result = contents.find(item => item.id === id);

    setCurrentContent(result);
  };

  useEffect(() => {
    events.on(Events.CANVAS_ADD_CONTENT, handleAddContent);
    events.on(Events.CANVAS_REMOVE_CONTENT, handleRemoveContent);
    events.on(Events.CANVAS_SET_CURRENT_CONTENT, handleSetCurrentContent);

    return () => {
      events.off(Events.CANVAS_ADD_CONTENT, handleAddContent);
      events.off(Events.CANVAS_REMOVE_CONTENT, handleRemoveContent);
      events.off(Events.CANVAS_SET_CURRENT_CONTENT, handleSetCurrentContent);
    };
  }, [contents, currentContent]);

  return (
    <CanvasContext.Provider value={{ contents, currentContent }}>
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasContext, CanvasProvider };