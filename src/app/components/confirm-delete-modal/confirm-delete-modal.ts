import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [CommonModule],
  templateUrl: './confirm-delete-modal.html',
  styleUrls: ['./confirm-delete-modal.scss']
})
export class ConfirmDeleteModalComponent implements OnChanges {

  @Input() visible: boolean = false;
  @Input() message: string = "Voulez-vous vraiment supprimer cet élément ?";
  @Input() action: any;

  @Output() confirmSend = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isSender: boolean = false;
  isDelete: boolean = false;
  styleAction: string = "";

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['action']) {
      this.updateActionState();
    }
  }

  private updateActionState(): void {
    this.isSender = this.action === 'send';
    this.isDelete = this.action === 'delete' || this.action === 'one';
    if(this.isSender){
      this.styleAction = 'send';
    }
    if (this.isDelete) {
      this.styleAction = 'delete';
    }
    console.log("🎯 Type d'action reçue :", this.action);
  }

  onConfirm() {
    if (this.isSender) {
      this.confirmSend.emit();
    } else if (this.isDelete) {
      this.confirmDelete.emit();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}

