import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private messageSource = new BehaviorSubject<any>("");
  message$ = this.messageSource.asObservable();

  sendMessage(variable: any) {
    this.messageSource.next(variable);
  }

  // Pour déclencher une action chez le Sender
  private triggerActionSource = new Subject<void>();
  triggerAction$ = this.triggerActionSource.asObservable();

  // Appelé par Receiver pour dire "Sender exécute ta méthode"
  triggerSenderAction() {
    this.triggerActionSource.next();
  }
}