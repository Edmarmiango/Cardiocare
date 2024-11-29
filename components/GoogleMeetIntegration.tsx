import { useState } from 'react'
import { Button } from "@/components/ui/button"

interface GoogleMeetIntegrationProps {
  appointmentId: string;
}

export function GoogleMeetIntegration({ appointmentId }: GoogleMeetIntegrationProps) {
  const [meetLink, setMeetLink] = useState<string | null>(null);

  const createMeeting = async () => {
    try {
      const response = await fetch('/api/create-meet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });
      const data = await response.json();
      setMeetLink(data.meetLink);
    } catch (error) {
      console.error('Error creating Google Meet:', error);
    }
  };

  return (
    <div>
      {!meetLink ? (
        <Button onClick={createMeeting}>Criar Google Meet</Button>
      ) : (
        <a href={meetLink} target="_blank" rel="noopener noreferrer">
          <Button>Entrar na Reunião</Button>
        </a>
      )}
    </div>
  );
}

