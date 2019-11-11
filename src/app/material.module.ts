import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';

// import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatCardModule } from '@angular/material/card';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatRippleModule } from '@angular/material/core';
// import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
// import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// import { MatListModule } from '@angular/material/list';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatStepperModule } from '@angular/material/stepper';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
//   imports: [MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule,
//    MatTabsModule, MatCardModule,MatDividerModule, MatSidenavModule, 
//    MatFormFieldModule, MatInputModule, MatDialogModule, MatListModule,
//    MatGridListModule, MatProgressBarModule, MatExpansionModule,
//    MatProgressSpinnerModule,MatButtonToggleModule, MatCheckboxModule, 
//    MatChipsModule, MatAutocompleteModule,MatSelectModule,
//    MatStepperModule, MatRadioModule, MatRippleModule, MatTooltipModule, MatSnackBarModule, ],
imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatDividerModule],
//   exports: [MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule,
//    MatTabsModule, MatCardModule,MatDividerModule, MatSidenavModule, 
//    MatFormFieldModule, MatInputModule, MatDialogModule, MatListModule,
//    MatGridListModule, MatProgressBarModule, MatExpansionModule,
//    MatProgressSpinnerModule,MatButtonToggleModule, MatCheckboxModule,
//    MatChipsModule, MatAutocompleteModule, MatSelectModule,
//    MatStepperModule, MatRadioModule, MatRippleModule, MatTooltipModule, MatSnackBarModule, ],
exports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatDividerModule]
})
export class MaterialModule { }
