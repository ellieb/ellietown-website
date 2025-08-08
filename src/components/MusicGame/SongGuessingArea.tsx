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
import "./SongGuessingArea.css";

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
    margin: "4px",
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

  // TODO: Use the styled-components library to have animation locally
  const extraClass =
    guessState === GuessState.Correct
      ? "backgroundAnimatedCorrect"
      : guessState === GuessState.Incorrect
      ? "backgroundAnimatedIncorrect"
      : "";

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
        <div className="song-guessing-scroll">
          <div className="song-guessing-row">
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
                  extraClass={track.id === currentTrackId ? extraClass : ""}
                />
              </SortableItem>
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default SongGuessingArea;
