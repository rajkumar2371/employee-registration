import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthenticationService } from './modules/authentication/authentication.service';
import { InsurerConfigService } from './shared/services/common/insurer-field.service';
import { SessionService } from './shared/services/common';
import { is_valid_value } from './core/utils/utils';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'mfac-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Motor';
  employeeForm !: FormGroup;
  employeeData = [];
  employeeSearchData = [];
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private InsurerStateService: InsurerConfigService,
    private sessionService: SessionService,
    private fb: FormBuilder,
  ) { }
  // ngOnInit() {
  //   this.router.events
  //     .pipe(
  //       filter((event) => event instanceof NavigationEnd),
  //       take(1),
  //     )
  //     .subscribe((event: NavigationEnd) => {
  //       const currentUrl = event.urlAfterRedirects || event.url;
  //       const isReload = performance
  //         .getEntriesByType('navigation')
  //         .some((nav: any) => nav.type === 'reload');
  //       const isLoginPage = currentUrl.includes('/login');
  //       const isForgotPasswordPage = currentUrl.includes('/forgot-password');
  //       const isPublicPage = isLoginPage || isForgotPasswordPage;
  //       if (
  //         is_valid_value(
  //           this.sessionService.getString('password_updated_date'),
  //         ) &&
  //         this.sessionService.getItem('loginIdentifier')['value'] &&
  //         !isPublicPage
  //       ) {
  //         const companyUrl = this.sessionService.getItem('companyUrl');
  //         this.router.navigate(['/', companyUrl, 'update-password']);
  //       }
  //       if (
  //         [1, '1'].includes(this.sessionService.getString('account_locked'))
  //       ) {
  //         const companyUrl = this.sessionService.getItem('companyUrl');
  //         this.router.navigate(['/', companyUrl, 'unlock-account']);
  //       }
  //       if (isReload && !isPublicPage && this.authService.isAuthenticated()) {
  //         this.authService.refreshPermissions();
  //         this.authService.refreshUserDetails();
  //         // const isInsurer = this.sessionService.getString('is_insurer');
  //         // if (isInsurer === '1') {
  //         //   this.InsurerStateService.isInsurer.set(true);
  //         // }
  //         // else{
  //         //   this.InsurerStateService.isInsurer.set(false);
  //         // }
  //       } else {
  //         console.log('Skipping refresh: not a reload or on login page.');
  //       }
  //     });
  // }
  ngOnInit() {
    this.employeeSearchData = sessionStorage.getItem('employeeData') ?
      JSON.parse(sessionStorage.getItem('employeeData') || '') : [];
    // this.employeeForm = new FormGroup({
    //   empNo: new FormControl(''),
    //   empName: new FormControl(''),
    //   empSalary: new FormControl(''),
    //   gender: new FormControl(''),
    //   maritalStatus: new FormControl(''),
    //   employeed: new FormControl(''),
    //   branch: new FormArray([])
    // });
    this.employeeForm = this.fb.group({
      empNo: ['', Validators.required],
      empName: ['', Validators.required],
      empSalary: ['', Validators.required],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      employeed: ['', Validators.required],
      branch: this.fb.array([], this.minSelectedCheckboxes(1))
    })
  }
  onSubmit() {
    this.employeeData.push(this.employeeForm.value);
    console.log('this.employeeData:', this.employeeData)
    this.employeeSearchData = this.employeeData;
    this.employeeForm.reset();
    (this.employeeForm.get('branch') as any).clear();
    console.log(this.employeeForm);
    console.log('this.employeeSearchData:', this.employeeSearchData)
    sessionStorage.setItem('employeeData', JSON.stringify(this.employeeData));
  }
  editEmployee(index: number) {
    const recordsToBeEdited = this.employeeData.find(item => item.empNo === index);
    this.employeeForm.patchValue({
      empNo: recordsToBeEdited.empNo,
      empName: recordsToBeEdited.empName,
      empSalary: recordsToBeEdited.empSalary,
      gender: recordsToBeEdited.gender,
      maritalStatus: recordsToBeEdited.maritalStatus,
      employeed: recordsToBeEdited.employeed,
      // branch: recordsToBeEdited.branch

    })
    const branchArray = this.employeeForm.get('branch') as any;
    branchArray.clear();

    recordsToBeEdited.branch.forEach((b: any) => {
      branchArray.push(this.fb.control(b));
    });
    this.employeeData = this.employeeData.filter(item => item.empNo !== index);
    this.employeeSearchData = this.employeeData;
    sessionStorage.setItem('employeeData', JSON.stringify(this.employeeData));
    // this.employeeSearchData = sessionStorage.getItem('employeeData') ?
    //   JSON.parse(sessionStorage.getItem('employeeData') || '') : [];

  }
  deleteEmployee(index: number) {
    this.employeeData = this.employeeData.filter(item => item.empNo !== index);
    this.employeeSearchData = this.employeeData;
    sessionStorage.setItem('employeeData', JSON.stringify(this.employeeData));

  }
  onBlur(event: any) {
    console.log(event.target.value);
    this.employeeSearchData = this.employeeData.filter(item =>
      item.empName.toLowerCase().includes(event.target.value.toLowerCase()) ||
      item.empNo.toLowerCase().includes(event.target.value.toLowerCase()) ||
      item.empSalary.toString().toLowerCase().includes(event.target.value.toLowerCase()) ||
      item.gender.toLowerCase().includes(event.target.value.toLowerCase())
    )
  }
  onBranchChange(event: any) {
    const branchArray = this.employeeForm.get('branch') as FormArray;

    if (event.target.checked) {
      branchArray.push(this.fb.control(event.target.value));
    } else {
      const index = branchArray.controls.findIndex(
        (x: any) => x.value === event.target.value
      );
      branchArray.removeAt(index);
    }
    console.log('employeeForm:', this.employeeForm)
    branchArray.markAsTouched();
  }
  getBranches(branches: any[]): string {
    return branches?.filter(b => b && b.trim()).join(', ') || '-';
  }
  minSelectedCheckboxes(min: number) {
    return (formArray: any) => {
      return formArray.length >= min ? null : { required: true };
    };
  }
}
