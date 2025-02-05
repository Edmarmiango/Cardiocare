'use client'

import { useState } from 'react'
import { Button } from "../components/ui/button"
import { toast } from "../components/ui/use-toast"

interface GoogleMeetIntegrationProps {
  appointmentId: string;
}

export function GoogleMeetIntegration({ appointmentId }: GoogleMeetIntegrationProps) {
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createMeeting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-meet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Received non-JSON response from server");
      }

      const data = await response.json();
      
      if (!data.meetLink) {
        throw new Error('No meet link received from server');
      }

      setMeetLink(data.meetLink);
      toast({
        title: "Success",
        description: "Google Meet link created successfully",
      });
    } catch (error) {
      console.error('Error creating Google Meet:', error);
      toast({
        title: "Error",
        description: "Failed to create Google Meet link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!meetLink ? (
        <Button 
          onClick={createMeeting} 
          disabled={isLoading}
          className="mt-2 mr-2"
        >
          {isLoading ? "Creating..." : "Criar Google Meet"}
        </Button>
      ) : (
        <a href={meetLink} target="_blank" rel="noopener noreferrer">
          <Button className="mt-2 mr-2">
            Entrar na Reunião
          </Button>
        </a>
      )}
    </div>
  );
}

