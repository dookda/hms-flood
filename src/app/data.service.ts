import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Item } from './item';

@Injectable()
export class DataService {

  constructor(
    private http: HttpClient
  ) { }

  getAccData(cql: string): Observable<Item[]> {
    return this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_data_v&cql_filter=' + cql + '&outputFormat=application%2Fjson')
      .map(res => <Item[]>res);
  }

  getAccNewyear2018(cql: string): Observable<Item[]> {
    return this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_deadnewyear2018_v&cql_filter=' + cql + '&outputFormat=application%2Fjson')
      .map(res => <Item[]>res);
  }

  getAccSongkran2017(cql: string): Observable<Item[]> {
    return this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_deadsongkran2017_v&cql_filter=' + cql + '&outputFormat=application%2Fjson')
      .map(res => <Item[]>res);
  }

  getAccSongkran2018(cql: string): Observable<Item[]> {
    return this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_deadsongkran2018_v&cql_filter=' + cql + '&outputFormat=application%2Fjson')
      .map(res => <Item[]>res);
  }

  getAccCheckpoint(cql: string): Observable<Item[]> {
    return this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_checkpoint2018_v&cql_filter=' + cql + '&outputFormat=application%2Fjson')
      .map(res => <Item[]>res);
  }

  getPlaceData(type: string, code: any) {
    return this.http.get('http://103.40.148.133/service/hgis_acc_count_by_place2.php?type=' + type + '&code=' + code)
      .map(res => res);
  }

  getPlaceSongkarn2018(type: string, code: any) {
    return this.http.get('http://103.40.148.133/service/hgis_songkarn2018_acc_count_by_place.php?type=' + type + '&code=' + code)
      .map(res => res);
  }

  getTimeData(type: string, code: any) {
    return this.http.get('http://103.40.148.133/service/hgis_acc_count_by_time2.php?type=' + type + '&code=' + code)
      .map(res => res);
  }

  getTimeSongkarn2018(type: string, code: any) {
    return this.http.get('http://103.40.148.133/service/hgis_songkarn2018_acc_count_by_time.php?type=' + type + '&code=' + code)
      .map(res => res);
  }

  getTimeHourSongkarn2018(type: string, code: any) {
    return this.http.get('http://103.40.148.133/service/hgis_songkarn2018_acc_count_by_time_hr.php?type=' + type + '&code=' + code)
      .map(res => res);
  }

  postAddMarker(data) {
    return this.http.post('http://103.40.148.133/service/hgis_acc_insert.php', data)
      .map(res => res);
  }

  postUpdateMarker(data) {
    return this.http.post('http://103.40.148.133/service/hgis_acc_update.php', data)
      .map(res => res);
  }

  postUpdateMarkerAttr(data) {
    return this.http.post('http://103.40.148.133/service/hgis_acc_update_attr.php', data)
      .map(res => res);
  }

  postDeleteMarker(data) {
    return this.http.post('http://103.40.148.133/service/hgis_acc_delete.php', data)
      .map(res => res);
  }

  postAdd7day(data) {
    return this.http.post('http://103.40.148.133/service/hgis_acc_7day2018_insert.php', data)
      .map(res => res);
  }

  getAddedMarker() {
    return this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_add_point_v&outputFormat=application%2Fjson')
      .map(res => <Item[]>res);
  }

  getdMarkerDetail(cql: string) {
    return this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_add_point_v&cql_filter=gid=' + cql + '&outputFormat=application%2Fjson')
      .map(res => <Item[]>res);
  }

}
