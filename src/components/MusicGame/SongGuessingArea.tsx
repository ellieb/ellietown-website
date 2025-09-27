import React from "react";
import styled from "@emotion/styled";
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import SongCard, { TrackInformation } from "./SongCard";

// Keyframes are now defined in SongCard component

// Styled components
const SongGuessingScroll = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: clip;
  -webkit-overflow-scrolling: touch;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black 10px,
    black calc(100% - 10px),
    transparent 100%
  );
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;

  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 10px,
    black calc(100% - 10px),
    transparent 100%
  );
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
`;

const SongGuessingRow = styled.div`
  display: flex;
  width: fit-content;
  flex-direction: row;
  align-items: flex-start;
  margin: 1em 0em;
  flex-wrap: nowrap; /* prevent wrapping so it scrolls horizontally */
  gap: 8px;
  padding: 0em 1em;

  /* Prevent children from shrinking so the row can overflow */
  & > * {
    flex: 0 0 auto;
  }
`;

// Just a normal sortable item — but will only be draggable for current track
function SortableItem({
  id,
  draggable,
  children,
}: {
  id: string;
  draggable: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !draggable, // disable drag if not current track
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : draggable ? "grab" : "default",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      {children}
    </div>
  );
}

// TODO: Put types in extra file to prevent circular dependencies
enum GuessState {
  Correct,
  Incorrect,
  NoGuess,
  Skip,
}

function SongGuessingArea({
  currentTrackId,
  guessState,
  sortedTracks,
  setSortedTracks,
}: {
  currentTrackId: string | null;
  guessState: GuessState;
  sortedTracks: TrackInformation[];
  setSortedTracks: React.Dispatch<React.SetStateAction<TrackInformation[]>>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Determine animation states
  const isCorrect = guessState === GuessState.Correct;
  const isIncorrect = guessState === GuessState.Incorrect;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setSortedTracks((prevSortedTracks) => {
        const oldIndex = sortedTracks.findIndex(
          (track) => track.id === active.id
        );
        const newIndex = sortedTracks.findIndex(
          (track) => track.id === over.id
        );

        return arrayMove(prevSortedTracks, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* Remove double-drop-zone problem by excluding "new-item" when dragged */}
      <SortableContext
        items={sortedTracks}
        strategy={horizontalListSortingStrategy}
      >
        <SongGuessingScroll>
          <SongGuessingRow>
            {sortedTracks.map((track) => (
              <SortableItem
                key={track.id}
                id={track.id}
                draggable={track.id === currentTrackId}
              >
                <SongCard
                  track={track}
                  hidden={
                    track.id === currentTrackId &&
                    guessState === GuessState.NoGuess
                  }
                  compact={
                    track.id === currentTrackId
                      ? guessState === GuessState.NoGuess
                      : true
                  }
                  extraClass={
                    track.id === currentTrackId ? "incorrect-guess" : ""
                  }
                  isCorrect={track.id === currentTrackId ? isCorrect : false}
                  isIncorrect={
                    track.id === currentTrackId ? isIncorrect : false
                  }
                />
              </SortableItem>
            ))}
          </SongGuessingRow>
        </SongGuessingScroll>
      </SortableContext>
    </DndContext>
  );
}

export default SongGuessingArea;
export { SongGuessingScroll, SongGuessingRow };
