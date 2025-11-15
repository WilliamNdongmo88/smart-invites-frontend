import { Injectable } from '@angular/core';

export interface ImportedGuest {
    eventId?: number;
    nom: string;
    email: string;
    phone?: string;
    rsvpStatus?: string;
    plusOne?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ImportGuestService {

  parseCSV(content: string): ImportedGuest[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const guests: ImportedGuest[] = [];
    const headers = this.parseCSVLine(lines[0]);
    // console.log("headers::", headers)
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
    //   console.log("### values::", values)
      const guest = this.mapRowToGuest(headers, values);
      if (guest && guest.nom && guest.email) {
        guests.push(guest);
      }
    }

    return guests;
  }

  async parseExcel(file: File): Promise<ImportedGuest[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        try {
          if (typeof (window as any).XLSX !== 'undefined') {
            const XLSX = (window as any).XLSX;
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const guests = jsonData.map((row: any) =>
              this.mapExcelRowToGuest(row)
            ).filter((guest: ImportedGuest | null) => guest !== null) as ImportedGuest[];

            resolve(guests);
          } else {
            const text = new TextDecoder().decode(e.target.result);
            resolve(this.parseCSV(text));
          }
        } catch (error) {
          reject(new Error('Erreur lors du parsing du fichier Excel'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private mapRowToGuest(headers: string[], values: string[]): ImportedGuest | null {
    const guest: ImportedGuest = {
      eventId: 0,
      nom: '',
      email: '',
    };

    const headerMap: { [key: string]: string } = {};
    headers.forEach((header, index) => {
        // console.log("### header.toLowerCase().trim()::", header.toLowerCase().trim())
        // console.log("### values[index]::", values[index])
      headerMap[header.toLowerCase().trim()] = values[index] || '';
    });
    // console.log("### [headerMap]::", headerMap)
    // Map common header variations
    const eventIdKeys = ['Id-Evenement', 'eventId', 'event_id', 'idEvent', 'id_event', 'id event'];
    const nameKeys = ['name', 'nom', 'prenom', 'first name', 'full name'];
    const emailKeys = ['email', 'e-mail', 'mail', 'email address'];
    const phoneKeys = ['phone', 'telephone', 'tel', 'mobile', 'téléphone'];
    const rsvpStatusKeys = ['statusRsvp', 'rsvpStatus', 'rsvp-status', 'Status-RSVP'];
    const plusOneKeys = ['plus one', 'plusone', '+1', 'guest', 'accompagnant'];

    // Find and assign values
    for (const key of eventIdKeys) {
      if (headerMap[key]) {
        guest.eventId = Number(headerMap[key]);
        break;
      }
    }

    for (const key of nameKeys) {
      if (headerMap[key]) {
        guest.nom = headerMap[key];
        break;
      }
    }

    for (const key of emailKeys) {
      if (headerMap[key]) {
        guest.email = headerMap[key];
        break;
      }
    }

    for (const key of phoneKeys) {
      if (headerMap[key]) {
        guest.phone = headerMap[key];
        break;
      }
    }

    for (const key of rsvpStatusKeys) {
      if (headerMap[key]) {
        guest.rsvpStatus = headerMap[key];
        break;
      }
    }

    for (const key of plusOneKeys) {
      if (headerMap[key]) {
        const value = headerMap[key].toLowerCase();
        guest.plusOne = value === 'yes' || value === 'oui' || value === '1' || value === 'true';
        break;
      }
    }
    // console.log("### [guest]::", guest)
    // return guest.name && guest.email ? guest : null;
    return headerMap as any;
  }

  private mapExcelRowToGuest(row: any): ImportedGuest | null {
    const guest: ImportedGuest = {
        eventId: 0,
        nom: '',
        email: ''
    };

    // Try to find name
    const eventIdKeys = ['Id-Evenement', 'eventId', 'event_id', 'idEvent', 'id_event', 'id event'];
    for (const key of eventIdKeys) {
      if (row[key]) {
        guest.eventId = row[key];
        break;
      }
    }

    const nameKeys = ['Name', 'Nom', 'Prénom', 'First Name', 'Full Name'];
    for (const key of nameKeys) {
      if (row[key]) {
        guest.nom = row[key];
        break;
      }
    }

    // Try to find email
    const emailKeys = ['Email', 'E-mail', 'Mail', 'Email Address'];
    for (const key of emailKeys) {
      if (row[key]) {
        guest.email = row[key];
        break;
      }
    }

    // Try to find phone
    const phoneKeys = ['Phone', 'Telephone', 'Tel', 'Mobile', 'Téléphone'];
    for (const key of phoneKeys) {
      if (row[key]) {
        guest.phone = row[key];
        break;
      }
    }

    // Try to find dietary restrictions
    const rsvpStatusKeys = ['statusRsvp', 'rsvpStatus', 'rsvp-status', 'Status-RSVP'];
    for (const key of rsvpStatusKeys) {
      if (row[key]) {
        guest.rsvpStatus = row[key];
        break;
      }
    }

    // Try to find plus one
    const plusOneKeys = ['Plus One', 'PlusOne', '+1', 'Guest', 'Accompagnant'];
    for (const key of plusOneKeys) {
      if (row[key]) {
        const value = String(row[key]).toLowerCase();
        guest.plusOne = value === 'yes' || value === 'oui' || value === '1' || value === 'true';
        break;
      }
    }

    return guest.nom && guest.email ? guest : null;
  }

  validateGuests(guests: ImportedGuest[]): { valid: ImportedGuest[]; errors: string[] } {
    const valid: ImportedGuest[] = [];
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    guests.forEach((guest, index) => {
      const rowNumber = index + 2; // +2 because of header and 0-indexing

      if (!guest.nom || guest.nom.trim() === '') {
        errors.push(`Ligne ${rowNumber}: Le nom est requis`);
      } else if (!guest.email || guest.email.trim() === '') {
        errors.push(`Ligne ${rowNumber}: L'email est requis`);
      } else if (!emailRegex.test(guest.email)) {
        errors.push(`Ligne ${rowNumber}: L'email "${guest.email}" est invalide`);
      } else {
        valid.push(guest);
      }
    });

    return { valid, errors };
  }

  generateCSVTemplate(): string {
    return `
      eventId,nom,email,phone,rsvpStatus,plusone
      1,Lucie Kamga,lucie.kamga@gmail.com,+237690117788,CONFIRMED,true
      1,Fabrice Nlend,fabrice.nlend@gmail.com,+237673890055,DECLINED,true
      2,Carine Fotso,carine.fotso@gmail.com,+237692009933,CONFIRMED,false
      1,Noel Talla,noel.talla@gmail.com,+237691667788,PENDING,true
      2,Nadine Ngah,nadine.ngah@gmail.com,+237674991144,CONFIRMED,true
    `;}

  downloadCSVTemplate() {
    const csv = this.generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'template-invites.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

