import { memo } from 'react';
import { CrossIcon } from './icons';
import { Button } from '../../../components/ui/button';
import { initialArtifactData, useArtifact } from '@/app/chat/hooks/use-artifact';

function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      data-testid="artifact-close-button"
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        setArtifact((currentArtifact) =>
          currentArtifact.status === 'streaming'
            ? {
                ...currentArtifact,
                isVisible: false,
              }
            : { ...initialArtifactData, status: 'idle' },
        );
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
