import { Component, inject } from '@angular/core';
import { Notifier } from '../../services/notifier';

@Component({
  selector: 'app-toast',
  styleUrl: './toast.css',
  templateUrl: './toast.html',
})
export class Toast {
  protected readonly notifier = inject(Notifier);
}
