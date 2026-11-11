import type { Layer, PathOptions } from 'leaflet';
import { GeoJSON as GeoJSONLayer, MapContainer, TileLayer } from 'react-leaflet';
import { colorFor } from '../features/weather/layers';
import type { MapLayer } from '../features/weather/types';

interface Props {
  geojson: GeoJSON.FeatureCollection;
  layer: MapLayer;
  selected: string | null;
  onSelect: (name: string) => void;
}

const SEOUL_CENTER: [number, number] = [37.5665, 126.978];

export default function WeatherMap({ geojson, layer, selected, onSelect }: Props) {
  const nameOf = (f?: GeoJSON.Feature) => (f?.properties?.name as string | undefined) ?? '';

  const style = (f?: GeoJSON.Feature): PathOptions => {
    const name = nameOf(f);
    const isSelected = name === selected;
    return {
      fillColor: colorFor(layer, layer.values[name]),
      fillOpacity: 0.75,
      color: isSelected ? '#111' : '#fff',
      weight: isSelected ? 3 : 1,
    };
  };

  const onEachFeature = (f: GeoJSON.Feature, l: Layer) => {
    const name = nameOf(f);
    const v = layer.values[name];
    l.bindTooltip(`${name}: ${v == null ? '값 없음' : `${v} ${layer.unit}`}`, { sticky: true });
    l.on('click', () => onSelect(name));
  };

  // 지표/선택이 바뀌면 key가 달라져 GeoJSON 레이어가 새로 그려진다.
  return (
    <MapContainer center={SEOUL_CENTER} zoom={11} minZoom={10} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSONLayer
        key={`${layer.id}-${selected ?? ''}`}
        data={geojson}
        style={style}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}
