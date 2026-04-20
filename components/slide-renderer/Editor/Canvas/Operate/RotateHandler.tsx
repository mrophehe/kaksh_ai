interface RotateHandlerProps {
  readonly style?: React.CSSProperties;
  readonly className?: string;
  readonly onMouseDown?: (e: React.MouseEvent) => void;
}

export function RotateHandler({ style, className, onMouseDown }: RotateHandlerProps) {
  return (
    <div
      className={`rotate-handler absolute w-2.5 h-2.5 -top-6.25 -ml-1.25 border border-primary bg-white rounded-[1px] cursor-grab active:cursor-grabbing ${className || ''}`}
      style={style}
      onMouseDown={onMouseDown}
    />
  );
}
