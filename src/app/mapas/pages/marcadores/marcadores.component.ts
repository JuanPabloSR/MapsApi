import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        height: 100vh;
        width: 100%;
      }

      .list-group {
        position: fixed;
        right: 20px;
        top: 20px;
        z-index: 99;
      }
      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit {
  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [-73.08921617761715, 7.086591243260588];

  //Arreglo de marcadores
  marcadores: MarcadorColor[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });

    this.leerLocalStorage();

    // this.mapa.on('click', (ev) => {
    //   const color = '#xxxxxx'.replace(/x/g, (y) =>
    //     ((Math.random() * 16) | 0).toString(16)
    //   );
    //   const marker = new mapboxgl.Marker({ color })
    //     .setLngLat(ev.lngLat)
    //     .addTo(this.mapa);

    //   this.marcadores.push({ color, marker });

    //   this.guardarMarcadoresLocalStorage();


    // });

    // const markerHtml: HTMLElement = document.createElement('div');
    // markerHtml.innerHTML = 'Hola mundo'

    // new mapboxgl.Marker()
    // .setLngLat(this.center)
    // .addTo(this.mapa);
  }

  agregarMarcador() {
    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16)
    );

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color,
    })
      .setLngLat(this.center)
      .addTo(this.mapa);

    this.marcadores.push({
      color,
      marker: nuevoMarcador,
    });

    this.guardarMarcadoresLocalStorage();

    nuevoMarcador.on('dragend', ()=>{
      this.guardarMarcadoresLocalStorage();
    })
  }

  irAlMarcador(marker: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: marker.getLngLat(),
    });
  }

  guardarMarcadoresLocalStorage() {
    const lngLarArr: MarcadorColor[] = [];

    this.marcadores.forEach((m) => {
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLarArr.push({
        color: color,
        centro: [lng, lat],
      });
    });

    localStorage.setItem('marcadores', JSON.stringify(lngLarArr));
  }

  leerLocalStorage() {
    if (!localStorage.getItem('marcadores')) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse(
      localStorage.getItem('marcadores')!
    );

    lngLatArr.forEach((m) => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true,
      })
        .setLngLat(m.centro!)
        .addTo(this.mapa);

      this.marcadores.push({
        marker: newMarker,
        color: m.color,
      });

      newMarker.on('dragend', ()=>{
        this.guardarMarcadoresLocalStorage();
      })
    });
  }

  borrarMarcador(i: number){
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i, 1);
    this.guardarMarcadoresLocalStorage();
  }
}
