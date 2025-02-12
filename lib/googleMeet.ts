import { calendar, executeWithTokenRefresh } from './google-calendar';
import { parse, isValid } from 'date-fns';

export async function createGoogleMeetLink(
  appointmentId: string,
  doctorName: string,
  patientName: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<string> {
  try {
    console.log('Creating Google Meet link with params:', {
      appointmentId,
      doctorName,
      patientName,
      date,
      startTime,
      endTime
    });

    // Expected date format: dd/MM/yyyy
    // Parse the date
    const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
    if (!isValid(parsedDate)) {
      throw new Error(`Invalid date format. Expected dd/MM/yyyy, got: ${date}`);
    }

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      throw new Error(`Invalid time format: start=${startTime}, end=${endTime}`);
    }

    const startDateTime = new Date(parsedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(parsedDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    if (!isValid(startDateTime) || !isValid(endDateTime)) {
      throw new Error('Invalid date or time combination');
    }

    console.log('Parsed dates:', {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    });

    const event = {
      summary: `Consulta: ${patientName} com Dr. ${doctorName}`,
      description: 'Consulta via CardioCare',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Africa/Luanda',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Africa/Luanda',
      },
      conferenceData: {
        createRequest: {
          requestId: appointmentId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    console.log('Creating calendar event with:', event);

    const response = await executeWithTokenRefresh(() => 
      calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
      })
    );

    if (!response.data.hangoutLink) {
      console.error('No hangoutLink in response:', response.data);
      throw new Error('Google Meet link not created');
    }

    console.log('Successfully created Meet link:', response.data.hangoutLink);
    return response.data.hangoutLink;
  } catch (error) {
    console.error('Error creating Google Meet link:', error);
    throw error;
  }
}
