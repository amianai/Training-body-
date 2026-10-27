import { Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { italianVoices, speak, useVoiceStatus } from '@/lib/voice'
import { useAppStore } from '@/store/useAppStore'

const SAMPLE = 'Ciao! Sono la tua voce guida. Flessioni, 8 ripetizioni. Mani sotto le spalle, corpo dritto. Vai!'

/** Quale voce italiana usa la guida, prova della voce e cosa fare se il telefono non ne ha. */
export function VoiceSettings() {
  const voiceName = useAppStore((s) => s.settings.voiceName)
  const setSetting = useAppStore((s) => s.setSetting)
  const status = useVoiceStatus(voiceName)

  if (status.kind === 'unsupported') {
    return <p className="px-1 text-sm text-muted-foreground">Questo browser non ha la sintesi vocale: apri l'app da Chrome.</p>
  }

  if (status.kind === 'missing') {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
        <p className="font-semibold text-accent">Sul telefono manca la voce italiana</p>
        <p>Così la guida resta zitta, invece di leggere l'italiano con una voce inglese. Per installarla sul Pixel:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Impostazioni → Sistema → Lingue → Output sintesi vocale</li>
          <li>Motore preferito: sintesi vocale di Google, poi tocca l'ingranaggio ⚙</li>
          <li>Installa dati vocali → Italiano (Italia) → scarica</li>
          <li>Chiudi del tutto Chrome e riapri l'app</li>
        </ol>
      </div>
    )
  }

  const voices = italianVoices()
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        {status.kind === 'ok' ? (
          <>
            Voce in uso: <span className="text-foreground">{status.voice.name}</span>
          </>
        ) : (
          'Il telefono non dice ancora quali voci ha: prova la voce per sentire se parla italiano.'
        )}
      </p>
      {voices.length > 1 && (
        <select
          id="voice-name"
          aria-label="Voce italiana"
          value={status.kind === 'ok' ? status.voice.name : ''}
          onChange={(e) => setSetting('voiceName', e.target.value)}
          className="h-11 rounded-md border border-input bg-background px-3 text-base"
        >
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      )}
      <Button variant="outline" size="lg" onClick={() => speak(SAMPLE, false, voiceName)}>
        <Volume2 /> Prova la voce
      </Button>
    </div>
  )
}
