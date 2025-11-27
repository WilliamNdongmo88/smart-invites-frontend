import { Injectable, signal } from '@angular/core';

export interface NotificationConfig {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  yesText?: string;
  noText?: string;
  onYes?: () => void;
  onNo?: () => void;
  autoClose?: boolean;
  duration?: number; // en millisecondes
}

export interface Notification extends NotificationConfig {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<Notification[]>([]);

  show(config: NotificationConfig): string {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      ...config,
      id,
      yesText: config.yesText || 'Oui',
      noText: config.noText || 'Non',
      autoClose: config.autoClose !== false,
      duration: config.duration || 5000,
    };

    this.notifications.update(notifs => [...notifs, notification]);

    // Auto-close après la durée spécifiée
    if (notification.autoClose && notification.type !== 'confirm') {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  remove(id: string): void {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
  }

  handleYes(notification: Notification): void {
    if (notification.onYes) {
      notification.onYes();
    }
    this.remove(notification.id);
  }

  handleNo(notification: Notification): void {
    if (notification.onNo) {
      notification.onNo();
    }
    this.remove(notification.id);
  }

  // Méthodes de commodité
  info(title: string, message: string): string {
    return this.show({ title, message, type: 'info' });
  }

  success(title: string, message: string): string {
    return this.show({ title, message, type: 'success' });
  }

  warning(title: string, message: string): string {
    return this.show({ title, message, type: 'warning' });
  }

  error(title: string, message: string): string {
    return this.show({ title, message, type: 'error' });
  }

  confirm(
    title: string,
    message: string,
    onYes: () => void,
    onNo?: () => void
  ): string {
    return this.show({
      title,
      message,
      type: 'confirm',
      onYes,
      onNo,
      autoClose: false,
    });
  }
}

