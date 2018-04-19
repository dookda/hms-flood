import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'home', title: 'สถิติอุบัติเหตุ', icon: 'pe-7s-graph', class: '' },
    { path: 'report', title: 'รายงานอุบัติเหตุ', icon: 'pe-7s-user', class: '' },
    { path: 'acc7day', title: '7 วัน อันตราย', icon: 'pe-7s-note2', class: '' }
];

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
    menuItems: any[];

    constructor() { }

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
    // isMobileMenu() {
    //     if ($(window).width() > 991) {
    //         return false;
    //     }
    //     return true;
    // }
}
