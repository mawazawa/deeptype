import { cn } from '@/lib/utils'; // Utility for merging class names

// ChartTooltip component with enhanced visual clarity and built-in debug logging
function ChartTooltip(): JSX.Element {
  console.debug("ChartTooltip: Rendering with classes 'text-muted-foreground' and 'bg-muted/50'");

  return (
    // The cn() utility ensures that Tailwind CSS classes are merged correctly for both text and background styling
    <div className={cn('text-muted-foreground', 'bg-muted/50', 'p-4', 'rounded-lg', 'shadow')}>
      <p className="font-semibold">This is your tooltip!</p>
      <small className="block mt-1">Additional info goes here.</small>
    </div>
  );
}

export { ChartTooltip };