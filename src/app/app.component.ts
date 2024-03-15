import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { evaluateArithmeticExpression } from './transformer';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  textareadata:any
  errormsg:any
  title = 'Analytics';
  Validate(){
    let IsValid = evaluateArithmeticExpression(this.textareadata)
    this.errormsg = IsValid['error']
  }
}
