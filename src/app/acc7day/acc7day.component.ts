import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import * as Highcharts from 'highcharts';

import { DataService } from '../data.service';

@Component({
  selector: 'app-acc7day',
  templateUrl: './acc7day.component.html',
  styleUrls: ['./acc7day.component.css']
})
export class Acc7dayComponent implements OnInit {

  public map: any;

  // select option
  public pros: any;
  public amps: any;
  public tams: any;
  public lyrs: any;
  public pro_ls: any;
  public amp_ls: any;
  public tam_ls: any;

  // layer
  public grod: any;
  public gter: any;
  public ghyb: any;
  public mbox: any;
  public pro: any;
  public amp: any;
  public tam: any;
  public ac_songkran2018: any;
  public ac_checkpoint: any;

  public uploaded: any;

  // check
  public ac_songkran2018_isChecked: any;
  public ac_checkpoint_isChecked: any;

  // map
  public center: any;
  public zoom: number;

  // view

  constructor(
    private http: HttpClient,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.center = [16.8, 99.9];
    this.zoom = 8;
    this.loadMap();
    this.initializePro();

    this.uploaded = false;
  }

  previewFile(e) {
    const input = e.target;
    const reader = new FileReader();
    reader.readAsText(input.files[0], 'windows-874');
    // reader.onload = loadHandler;
    reader.onload = () => {
      const text = reader.result;
      // console.log(text);
      this.processData(text);
    };
  }

  async processData(csv) {
    const allTextLines = csv.split(/\r\n|\n/);
    const lines = [];
    for (let i = 0; i < allTextLines.length; i++) {
      const data = allTextLines[i].split(',');
      const tarr = [];
      for (let j = 0; j < data.length; j++) {
        tarr.push(data[j]);
      }
      lines.push(tarr);
    }
    // console.log(lines);
    await this.csv2json(lines);
  }

  async csv2json(csv) {
    // const array = CSVToArray(csv);
    const array = csv;
    const objArray = [];
    for (let i = 1; i < array.length; i++) {
      objArray[i - 1] = {};
      for (let k = 0; k < array[0].length && k < array[i].length; k++) {
        const key = array[0][k];
        objArray[i - 1][key] = array[i][k]
        // console.log(objArray[i - 1][key]);
      }
    }
    const json = JSON.stringify(objArray);

    const str = json.replace(/},/g, '},\r\n');

    objArray.forEach((a) => {
      if (Number(a.lon) > 0) {
        console.log(a.lon);
        const data = {
          lon: Number(a.lon),
          lat: Number(a.lat),
          acc_date: a.acc_date,
          acc_time: a.acc_time,
          acc_time_hr: a.acc_time_hr,
          acc_caption: a.acc_caption,
          acc_desc: a.acc_desc,
          acc_img: a.acc_img,
          acc_link: a.acc_link,
        };

        this.dataService.postAdd7day(data).subscribe(res => {
          // console.log(res);
          this.uploaded = true;
          this.load_ac_songkran2018('prov_code > 0');
        },
          err => {
            console.log(err);
          }
        );
      }
    });

  }


  async initializePro() {
    await this.http.get('http://cgi.uru.ac.th/service/dpc_prov.php')
      .subscribe(res => {
        this.pros = res;
        // console.log(res);
      }, error => {
        console.log('Oooops!');
      });


    this.load_ac_songkran2018('prov_code > 0');
    this.load_ac_checkpoint('prov_code > 0');

    this.accPlaceChart('all', 'all');
    this.accTimeChart('all', 'all');
    this.accHourChart('all', 'all');
  }

  async initializeAmp(provcode) {
    console.log(provcode);
    if (provcode === 'all') {
      this.pro.setParams({ 'cql_filter': 'prov_code > 0' });
      this.amp.setParams({ 'cql_filter': 'amp_code > 0' });
      this.tam.setParams({ 'cql_filter': 'tam_code > 0' });
      this.map.setView(this.center, this.zoom);
      this.amps = null;
      this.tams = null;

      this.load_ac_songkran2018('prov_code > 0');
      this.load_ac_checkpoint('prov_code > 0');

      this.accPlaceChart('all', 'all');
      this.accTimeChart('all', 'all');
      this.accHourChart('all', 'all');
    } else {
      this.pro.setParams({ 'cql_filter': 'prov_code=' + provcode });
      this.amp.setParams({ 'cql_filter': 'prov_code=' + provcode });
      this.tam.setParams({ 'cql_filter': 'prov_code=' + provcode });

      await this.http.get('http://cgi.uru.ac.th/service/dpc_amp.php?procode=' + provcode)
        .subscribe(res => {
          this.amps = res;
          this.tams = null;
        }, error => {
          console.log('Oooops!');
        });

      await this.http.get('http://cgi.uru.ac.th/service/dpc_prov.php?procode=' + provcode)
        .subscribe(res => {
          const bbox = [[Number(res[0].ymin), Number(res[0].xmax)], [Number(res[0].ymax), Number(res[0].xmin)]];
          this.map.fitBounds(bbox);
        }, error => {
          console.log('Oooops!');
        });

      this.load_ac_songkran2018('prov_code=' + provcode);
      this.load_ac_checkpoint('prov_code=' + provcode);

      this.accPlaceChart('pro', provcode);
      this.accTimeChart('pro', provcode);
      this.accHourChart('pro', provcode);
    }
  }

  async initializeTam(ampcode: any) {
    this.amp.setParams({ 'cql_filter': 'amp_code=' + ampcode });
    this.tam.setParams({ 'cql_filter': 'amp_code=' + ampcode });

    await this.http.get('http://cgi.uru.ac.th/service/dpc_tam.php?ampcode=' + ampcode)
      .subscribe(res => {
        this.tams = res;
      }, error => {
        console.log('Oooops!');
      });

    await this.http.get('http://cgi.uru.ac.th/service/dpc_amp.php?ampcode=' + ampcode)
      .subscribe(res => {
        const bbox = [[Number(res[0].ymin), Number(res[0].xmax)], [Number(res[0].ymax), Number(res[0].xmin)]];
        this.map.fitBounds(bbox);
      }, error => {
        console.log('Oooops!');
      });

    this.load_ac_songkran2018('amp_code=' + ampcode);
    this.load_ac_checkpoint('amp_code=' + ampcode);

    this.accPlaceChart('amp', ampcode);
    this.accTimeChart('amp', ampcode);
    this.accHourChart('amp', ampcode);
  }

  async tamExt(tamcode: any) {
    this.tam.setParams({ 'cql_filter': 'tam_code=' + tamcode });

    await this.http.get('http://cgi.uru.ac.th/service/dpc_tam.php?tamcode=' + tamcode)
      .subscribe(res => {
        const bbox = [[Number(res[0].ymin), Number(res[0].xmax)], [Number(res[0].ymax), Number(res[0].xmin)]];
        this.map.fitBounds(bbox);
      }, error => {
        console.log('Oooops!');
      });

    this.load_ac_songkran2018('tam_code=' + tamcode);
    this.load_ac_checkpoint('tam_code=' + tamcode);

    this.accPlaceChart('tam', tamcode);
    this.accTimeChart('tam', tamcode);
    this.accHourChart('tam', tamcode);
  }


  async loadMap() {
    this.map = L.map('map', {
      center: this.center,
      zoom: this.zoom,
      // zoomControl: false,
      // layersControl: false
    });

    // base map
    this.mbox = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    this.grod = L.gridLayer.googleMutant({
      type: 'roadmap'
    });

    this.ghyb = L.gridLayer.googleMutant({
      type: 'hybrid'
    });

    this.gter = L.gridLayer.googleMutant({
      type: 'terrain'
    });

    // overlay
    const mapnuUrl = 'http://map.nu.ac.th/geoserver-hgis/ows?';
    const cgiUrl = 'http://www.cgi.uru.ac.th/gs-hms/ows?';

    this.pro = L.tileLayer.wms(mapnuUrl, {
      layers: 'hgis:dpc9_province_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5
    });

    this.amp = L.tileLayer.wms(mapnuUrl, {
      layers: 'hgis:dpc9_amphoe_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5
    });

    this.tam = L.tileLayer.wms(mapnuUrl, {
      layers: 'hgis:dpc9_tambon_4326',
      format: 'image/png',
      transparent: true,
      zIndex: 5
    });


    const baseLayers = {
      'map box': this.mbox,
      'แผนที่ถนน': this.grod.addTo(this.map),
      'แผนที่ภาพดาวเทียม': this.ghyb,
      'แผนที่ภูมิประเทศ': this.gter,
    };
    const overlayLayers = {

      // 'ขอบเขตจังหวัด2': this.d_newyear2018.addTo(this.map),
      'ขอบเขตจังหวัด': this.pro.addTo(this.map),
      'ขอบเขตอำเภอ': this.amp.addTo(this.map),
      'ขออบเขตตำบล': this.tam.addTo(this.map),
    };

    this.pro.isChecked = true;
    this.amp.isChecked = true;
    this.tam.isChecked = true;
    this.ac_songkran2018_isChecked = true;
    this.ac_checkpoint_isChecked = true;

    // disable control
    // L.control.layers(baseLayers, overlayLayers).addTo(this.map);
  }

  async load_ac_songkran2018(cql: string) {
    const accIcon = L.icon({
      iconUrl: 'http://103.40.148.133/marker/car.png',
      iconSize: [25, 30],
    });

    if (this.map.hasLayer(this.ac_songkran2018) === true) {
      this.map.removeLayer(this.ac_songkran2018);
    }

    await this.dataService.getAccSongkran2018(cql).subscribe((res: any) => {

      if (this.map.hasLayer(this.ac_songkran2018) === true) {
        this.map.removeLayer(this.ac_songkran2018);
      }

      this.ac_songkran2018 = L.geoJSON(res, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: accIcon });
        },
        onEachFeature: function (feature, layer) {
          // console.log(feature);
          const mrklon = feature.properties.lon;
          const mrklat = feature.properties.lat;
          const popupContent =
            '<strong><i class="fa fa-file-text-o margin-r-5"></i> Notes</strong>' +
            '<p>' + feature.properties.acc_desc + '</p>' +
            ' <p>' +
            '<span class="label label-danger">lat: ' + mrklat + ' lon: ' + mrklon + '</span>&nbsp;' +
            '<span class="label label-success">date: ' + feature.properties.acc_date + '</span>&nbsp;' +
            '<span class="label label-info">time: ' + feature.properties.acc_time + '</span>' +
            '<hr>' +
            '<img src="' + feature.properties.acc_img + '" width="400">' +
            '<hr>' +
            '<iframe src="http://cgi.uru.ac.th/hms2/admin/streetview.php?lat=' + mrklat + '&lon=' + mrklon + '" width="400" height="200" frameborder="0" style="border:0" allowfullscreen></iframe>' +
            '</p>';

          const widthPop = {
            minWidth: 400
          };
          layer.bindPopup(popupContent, widthPop);
        }
      });
      this.onCheckJson('ac_songkran2018', this.ac_songkran2018_isChecked);
    });
  }

  async load_ac_checkpoint(cql: string) {
    const accIcon = L.icon({
      iconUrl: 'http://www.cgi.uru.ac.th/marker/photography.png',
      iconSize: [25, 30],
    });

    if (this.map.hasLayer(this.ac_checkpoint) === true) {
      this.map.removeLayer(this.ac_checkpoint);
    }

    await this.dataService.getAccCheckpoint(cql).subscribe((res: any) => {
      this.ac_checkpoint = L.geoJSON(res, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: accIcon });
        },
        onEachFeature: function (feature, layer) {
          // console.log(feature);
          const mrklon = feature.properties.lon;
          const mrklat = feature.properties.lat;
          const popupContent =
            '<strong><i class="fa fa-file-text-o margin-r-5"></i> Notes</strong>' +
            '<p>' + feature.properties.ac_desc + '</p>' +
            ' <p>' +
            '<span class="label label-danger">lat: ' + mrklat + ' lon: ' + mrklon + '</span>&nbsp;' +
            // '<span class="label label-success">date: ' + feature.properties.ac_date + '</span>&nbsp;' +
            // '<span class="label label-info">time: ' + feature.properties.ac_time + '</span>' +
            '<hr>' +
            // '<img src="' + feature.properties.ac_img + '" width="400">' +
            // '<hr>' +
            '<iframe src="http://cgi.uru.ac.th/hms2/admin/streetview.php?lat=' + mrklat + '&lon=' + mrklon + '" width="400" height="200" frameborder="0" style="border:0" allowfullscreen></iframe>' +
            '</p>';

          const widthPop = {
            minWidth: 400
          };
          layer.bindPopup(popupContent, widthPop);
        }
      });
      this.onCheckJson('ac_checkpoint', this.ac_checkpoint_isChecked);
    });
  }

  onCheckWms(lyr: string, isChecked: boolean) {
    const lyrOverlay = [
      { id: 'pro', lyr: this.pro },
      { id: 'amp', lyr: this.amp },
      { id: 'tam', lyr: this.tam }
    ];

    if (isChecked) {
      for (const i in lyrOverlay) {
        if (lyrOverlay[i].id === lyr) {
          this.map.addLayer(lyrOverlay[i].lyr);
          lyrOverlay[i].lyr.isChecked = true;
        }
      }
    } else {
      for (const i in lyrOverlay) {
        if (lyrOverlay[i].id === lyr) {
          this.map.removeLayer(lyrOverlay[i].lyr);
          lyrOverlay[i].lyr.isChecked = false;
        }
      }
    }
  }

  onCheckJson(lyr: string, isChecked: boolean) {
    if (isChecked) {
      if (lyr === 'ac_songkran2018') {
        this.map.addLayer(this.ac_songkran2018);
        this.ac_songkran2018_isChecked = true;
      } else if (lyr === 'ac_checkpoint') {
        this.map.addLayer(this.ac_checkpoint);
        this.ac_checkpoint_isChecked = true;
      }
    } else {
      if (lyr === 'ac_songkran2018') {
        this.map.removeLayer(this.ac_songkran2018);
        this.ac_songkran2018_isChecked = false;
      } else if (lyr === 'ac_checkpoint') {
        this.map.removeLayer(this.ac_checkpoint);
        this.ac_checkpoint_isChecked = false;
      }
    }
  }

  onSelect(lyr) {
    const lyrBase = [
      { id: 'grod', lyr: this.grod },
      { id: 'ghyb', lyr: this.ghyb },
      { id: 'gter', lyr: this.gter },
      { id: 'mbox', lyr: this.mbox }
    ];

    for (const i in lyrBase) {
      if (lyrBase[i].id === lyr) {
        this.map.addLayer(lyrBase[i].lyr);
      } else {
        this.map.removeLayer(lyrBase[i].lyr);
      }
    }
  }

  async accPlaceChart(type: string, code: any) {
    await this.dataService.getPlaceSongkarn2018(type, code).subscribe(res => {
      const cdata = res['list'].map((res) => Number(res.count_case));
      const cname = res['list'].map((res) => res.count_name);
      Highcharts.chart({
        chart: {
          renderTo: 'place',
          zoomType: 'x'
        },
        title: {
          text: 'อุบัติเหตุ',
          style: {
            display: 'none'
          }
        },
        // subtitle: {
        //     text: 'แหล่งข้อมูล: กรมอุตุนิยมวิทยา'
        // },
        xAxis: {
          categories: cname
        },
        yAxis: {
          title: {
            text: 'จำนวน (ครั้ง)'
          }
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'อุบัติเหตุ',
          type: 'column',
          color: '#0066FF',
          data: cdata
        }, {
          name: 'อุบัติเหตุ',
          type: 'spline',
          data: cdata
        }]
      });
    });
  }

  async accTimeChart(type: string, code: any) {
    // const cdata = [];
    // const cname = [];
    await this.dataService.getTimeSongkarn2018(type, code).subscribe(res => {
      const tdata = res['list'].map((res) => Number(res.count_case));
      const tname = res['list'].map((res) => res.case_date);

      Highcharts.chart({
        chart: {
          renderTo: 'time',
          zoomType: 'x'
        },
        title: {
          text: 'อุบัติเหตุ',
          style: {
            display: 'none'
          }
        },
        xAxis: {
          categories: tname
        },
        yAxis: {
          title: {
            text: 'จำนวน (ครั้ง)'
          }
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'อุบัติเหตุ',
          type: 'column',
          color: '#f48641',
          data: tdata
        }]
      });
    });
  }

  async accHourChart(type: string, code: any) {
    // const cdata = [];
    // const cname = [];
    await this.dataService.getTimeHourSongkarn2018(type, code).subscribe(res => {
      const tdata = res['list'].map((res) => Number(res.count_case));
      const tname = res['list'].map((res) => res.acc_time_hr);

      Highcharts.chart({
        chart: {
          renderTo: 'hour',
          zoomType: 'x'
        },
        title: {
          text: 'อุบัติเหตุ',
          style: {
            display: 'none'
          }
        },
        xAxis: {
          categories: tname
        },
        yAxis: {
          title: {
            text: 'จำนวน (ครั้ง)'
          }
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'เวลาที่เกิด (ใน 24 ชม.)',
          type: 'column',
          color: '#51ba4e',
          data: tdata
        }]
      });
    });
  }

}
