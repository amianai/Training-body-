import { Volume2, VolumeX } from 'lucide-react'

import { stopSpeaking, voiceAvailable } from '@/lib/voice'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

/** Tasto altoparlante: accende e spegne la voce guida. */
export function VoiceToggle({ className }: { className?: string }) {
  const on = useAppStore((s) => s.settings.voice)
  const setSetting = useAppStore((s) => s.setSetting)
  if (!voiceAvailable) return null
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Spegni la voce guida' : 'Accendi la voce guida'}
      onClick={() => {
        if (on) stopSpeaking()
        setSetting('voice', !on)
      }}
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-full border bg-card transition-colors active:bg-secondary',
        on ? 'text-primary' : 'text-muted-foreground',
        className,
      )}
    >
      {on ? <Volume2 className="size-6" /> : <VolumeX className="size-6" />}
    </button>
  )
}
