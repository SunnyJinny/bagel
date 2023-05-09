import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AVATARS } from './avatar';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})

export class SidenavComponent implements OnInit{
       
  @Output() closeSideNav = new EventEmitter();
  navMode: string = 'default';
  avatars = AVATARS;
  curUser = {
    userId: '',
    googleID: '',
    username: '',
    avatarUrl: '',
    rwthVerified: false,
  }

  constructor( 
    private _authService: AuthService, 
    private toastr: ToastrService,
    private router: Router,
    private cookieService: CookieService
  ) {}
  
  ngOnInit(): void {
    this.curUser.username = this._authService.getUsername();
    this.curUser.avatarUrl = this._authService.getAvatarUrl();
    this.curUser.rwthVerified = this._authService.getVerified();
    console.log(this.curUser);
	}
  onToggleClose(): void {
    this.closeSideNav.emit();
  }
  changeViewMode() {
    if(this.navMode=='default') {
      this.navMode = 'edit';
    } else {
      this.navMode = 'default';
    }
  }
  changeAvatar(imageObject: { avatarUrl: string; }) {
    this.curUser.avatarUrl = imageObject.avatarUrl;
  }  
  updateUser() {
    this._authService.updateUser(this.curUser)
    .subscribe({
      next: (updatedUser) => {
        this.curUser = updatedUser;    
        this._authService.setAvatarUrl(updatedUser.avatarUrl);
        // todo: username도 update()
      },
      error: (err) => {
        console.error('Failed to update user:', err);
      }
    })
    this.navMode = 'default';
  }
  signOut() {
    this.toastr.warning('여기를 클릭해주세요 !', 'Log out을 원하면')
      .onTap
      .pipe(take(1))
      .subscribe(() => {
        this._authService.logoutUser();
        this.onToggleClose();
      }
    );
    this._authService.setLoggedOut();
    this.cookieService.deleteAll();
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
