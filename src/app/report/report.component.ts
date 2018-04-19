import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-draw';
import * as Highcharts from 'highcharts';

import { DataService } from '../data.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

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

  // check
  public accIcon: any;
  public pnt: any;
  public mkr = [];
  public editableLayers: any;
  public btnAddAttr: any;

  // map
  public center: any;
  public zoom: number;

  // marker detail
  public ac_gid: any;
  public ac_desc: any;
  public ac_tam: any;
  public ac_amp: any;
  public ac_pro: any;

  // edit
  public drawOption: any;

  constructor(
    private http: HttpClient,
    private dataService: DataService
  ) { }

  async ngOnInit() {
    this.center = [16.8, 99.9];
    this.zoom = 8;

    this.map = L.map('map', {
      center: this.center,
      zoom: this.zoom,
      // zoomControl: false,
      // layersControl: false
    });

    // await this.load_ac_checkpoint();
    await this.loadMap();
    // await this.load_ac_data();
    this.initializePro();
    this.btnAddAttr = true;
  }

  async initializePro() {
    await this.http.get('http://cgi.uru.ac.th/service/dpc_prov.php')
      .subscribe(res => {
        this.pros = res;
        // console.log(res);
      }, error => {
        console.log('Oooops!');
      });
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
  }

  async loadMap() {
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

    // geojson data
    this.accIcon = L.icon({
      shadowUrl: null,
      iconAnchor: new L.Point(12, 12),
      iconSize: new L.Point(25, 30),
      iconUrl: 'http://www.cgi.uru.ac.th/marker/photography.png'
      // iconUrl: 'http://www.cgi.uru.ac.th/marker/marker2/above_ground.png'
    });

    // create L.FeatureGroup and Call data
    this.editableLayers = new L.FeatureGroup();
    await this.addMarker();

    // draw option
    this.drawOption = {
      position: 'topright',
      draw: {
        polyline: false,
        polygon: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        marker: {
          icon: this.accIcon
        }
      },
      edit: {
        featureGroup: await this.editableLayers,
        remove: true
      }
    };

    const drawControl = new L.Control.Draw(this.drawOption);

    this.map.addControl(drawControl);

    this.map.on('draw:created', (e) => {
      // const layers = e.layer;
      const data = {
        geom: (JSON.stringify(e.layer.toGeoJSON().geometry)),
        lon: Number(e.layer._latlng.lng),
        lat: Number(e.layer._latlng.lat),
        ac_desc: 'ตำแหน่งเกิดเหตุ'
      };

      this.dataService.postAddMarker(data).subscribe(res => {
        console.log(res);
        this.addMarker();
      },
        err => {
          console.log(err);
        }
      );
    });

    this.map.on('draw:edited', (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const data = {
          geom: (JSON.stringify(layer.toGeoJSON().geometry)),
          gid: layer.options.alt
        };

        this.dataService.postUpdateMarker(data).subscribe(res => {
          console.log(res);
          this.addMarker();
        },
          err => {
            console.log(err);
          }
        );
      });
    });

    this.map.on('draw:deleted', (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const data = {
          geom: (JSON.stringify(layer.toGeoJSON().geometry)),
          gid: layer.options.alt
        };

        this.dataService.postDeleteMarker(data).subscribe(res => {
          console.log(res);
          this.addMarker();
        },
          err => {
            console.log(err);
          }
        );
      });
    });

    // layers control
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
      'markerLayer': this.editableLayers,
    };

    // disable control
    // L.control.layers(baseLayers, overlayLayers).addTo(this.map);
  }

  async addMarker() {

    const accIcon2 = L.icon({
      iconUrl: 'http://www.cgi.uru.ac.th/marker/car.png',
      iconSize: [25, 30],
    });
    await this.http.get('http://103.40.148.133/gs-hms/hms/ows?service=WFS&request=GetFeature&typeName=hms:ac_add_point_v&outputFormat=application%2Fjson')
      .subscribe((res: any) => {
        this.editableLayers.clearLayers();
        res.features.forEach(m => {
          this.editableLayers.addLayer(
            L.marker([m.properties.lat, m.properties.lon], {
              alt: m.properties.gid,
              icon: this.accIcon
            })
          );
        });
      });

    this.editableLayers.addTo(this.map).on('click', (e) => {
      // this.editableLayers.setIcon(accIcon2);
      if (this.pnt != null) {
        this.pnt.layer.setIcon(this.accIcon);
      }
      // console.log(this.editableLayers);
      this.editAttr(e);
      this.pnt = e;
    });
  }

  editAttr(e) {
    const accIcon = L.icon({
      iconUrl: 'http://www.cgi.uru.ac.th/marker/car.png',
      iconSize: [25, 30],
    });

    e.layer.setIcon(accIcon);
    // console.log(e.target);
    this.btnAddAttr = false;
    this.dataService.getdMarkerDetail(e.layer.options.alt).subscribe((res) => {
      // console.log(res['features'][0]);
      this.ac_gid = res['features'][0].properties.gid;
      this.ac_desc = res['features'][0].properties.ac_desc;
      this.ac_tam = res['features'][0].properties.tam_nam_t;
      this.ac_amp = res['features'][0].properties.amp_nam_t;
      this.ac_pro = res['features'][0].properties.prov_nam_t;
    });
  }

  insertDetail() {
    const data = {
      ac_gid: this.ac_gid,
      ac_desc: this.ac_desc
    };
    this.dataService.postUpdateMarkerAttr(data).subscribe(res => {
      // console.log(res);
      this.pnt.layer.setIcon(this.accIcon);
    });
  }

  cancelDetail() {
    if (this.pnt != null) {
      this.pnt.layer.setIcon(this.accIcon);
      this.ac_desc = null;
      this.ac_tam = null;
      this.ac_amp = null;
      this.ac_pro = null;
      this.btnAddAttr = true;
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
}

interface JsonData {
  features: any;
  gemetry: any;
  coordinates: any;
  properties: any;
  ac_name: string;
  ac_desc: string;
}
