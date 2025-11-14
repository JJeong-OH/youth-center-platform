import type { Booking, ProgramApplication } from '../types/types';

/*
  NOTE FOR REAL-WORLD IMPLEMENTATION:
  This service simulates a backend that would connect to a Google Sheet.
  The user provided Google Sheet ID: 15cTWXt8rcf1BNUof4VMWR5hJctEcFnrPAtwWgKcKYN0

  For security reasons, frontend applications cannot directly and securely access Google Sheets.
  A backend server (e.g., using Node.js, Google Cloud Functions, or Google Apps Script) is required.
  The backend would handle authentication and communication with the Google Sheets API.
  The frontend would then make secure API calls (e.g., using fetch) to this backend.

  The functions below are async and use a timeout to simulate network latency.
  They currently operate on an in-memory database for demonstration purposes.
*/

// --- Mock Database ---
let bookingsDb: Booking[] = [];
let applicationsDb: ProgramApplication[] = [];

// --- API Simulation ---

const apiDelay = 500; // ms

// == Bookings API ==

export const getBookings = async (): Promise<Booking[]> => {
  console.log('API CALL: Fetching all bookings...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('API RESPONSE: Success - returned bookings.', bookingsDb);
      resolve([...bookingsDb]);
    }, apiDelay);
  });
};

export const addBooking = async (newBooking: Omit<Booking, 'bookingId'>): Promise<Booking> => {
  console.log('API CALL: Adding new booking...', newBooking);
  return new Promise(resolve => {
    setTimeout(() => {
      const booking: Booking = {
        ...newBooking,
        bookingId: `BK-${Date.now()}`,
      };
      bookingsDb.push(booking);
      console.log('API RESPONSE: Success - added booking.', booking);
      resolve(booking);
    }, apiDelay);
  });
};

export const deleteBooking = async (bookingId: string): Promise<{ success: boolean }> => {
  console.log('API CALL: Deleting booking...', bookingId);
  return new Promise(resolve => {
    setTimeout(() => {
      const initialLength = bookingsDb.length;
      bookingsDb = bookingsDb.filter(b => b.bookingId !== bookingId);
      const success = bookingsDb.length < initialLength;
      console.log(`API RESPONSE: ${success ? 'Success' : 'Failure'} - deleted booking.`);
      resolve({ success });
    }, apiDelay);
  });
};


// == Applications API ==

export const getApplications = async (): Promise<ProgramApplication[]> => {
  console.log('API CALL: Fetching all applications...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('API RESPONSE: Success - returned applications.', applicationsDb);
      resolve([...applicationsDb]);
    }, apiDelay);
  });
};


export const addApplication = async (newApplication: Omit<ProgramApplication, 'applicationId'>): Promise<ProgramApplication> => {
  console.log('API CALL: Adding new application...', newApplication);
  return new Promise(resolve => {
    setTimeout(() => {
      const application: ProgramApplication = {
        ...newApplication,
        applicationId: `AP-${Date.now()}`,
      };
      applicationsDb.push(application);
      console.log('API RESPONSE: Success - added application.', application);
      resolve(application);
    }, apiDelay);
  });
};

export const deleteApplication = async (applicationId: string): Promise<{ success: boolean }> => {
  console.log('API CALL: Deleting application...', applicationId);
  return new Promise(resolve => {
    setTimeout(() => {
      const initialLength = applicationsDb.length;
      applicationsDb = applicationsDb.filter(a => a.applicationId !== applicationId);
      const success = applicationsDb.length < initialLength;
      console.log(`API RESPONSE: ${success ? 'Success' : 'Failure'} - deleted application.`);
      resolve({ success });
    }, apiDelay);
  });
};
