import { Component, OnInit } from '@angular/core';

interface EventReport {
  title: string;
  subtitle: string;
  total_invited: number;
  total_confirmed: number;
  total_declined: number;
  total_present: number;
  total_no_show: number;
  attendance_rate: number;
  confirmation_rate: number;
  summary: string;
  insights: string;
}

@Component({
  selector: 'app-event-report',
  templateUrl: './event-report.component.html',
  styleUrls: ['./event-report.component.scss']
})
export class EventReportComponent implements OnInit {
  eventReport: EventReport;

  constructor() {
    this.eventReport = {
      title: 'Conférence Annuelle 2024',
      subtitle: 'Rapport d\'événement - 22 novembre 2024',
      total_invited: 250,
      total_confirmed: 185,
      total_declined: 35,
      total_present: 168,
      total_no_show: 17,
      attendance_rate: 0,
      confirmation_rate: 0,
      summary: 'L\'événement s\'est déroulé avec succès, accueillant 168 participants sur les 250 invités. Le taux de confirmation était excellent à 74%, reflétant un intérêt marqué pour la conférence. Malgré quelques absences, la participation a dépassé les attentes avec un taux de présence de 67.2%.',
      insights: 'Points positifs : Très bon taux de confirmation (74%) et participation solide. Les invités ont montré un engagement remarquable. Recommandations : Pour les futurs événements, envisager un système de rappel 48h avant pour améliorer le taux de présence. Le ratio confirmés/présents est bon et peut servir de base pour la planification future.'
    };
  }

  ngOnInit(): void {
    this.calculateRates();
  }

  calculateRates(): void {
    // Calcul du taux de confirmation
    this.eventReport.confirmation_rate = (this.eventReport.total_confirmed / this.eventReport.total_invited) * 100;
    
    // Calcul du taux de présence (basé sur les confirmés)
    this.eventReport.attendance_rate = (this.eventReport.total_present / this.eventReport.total_invited) * 100;
  }
}
