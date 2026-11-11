import { legendItems } from '../features/weather/layers';
import type { MapLayer } from '../features/weather/types';

export default function Legend({ layer, caption }: { layer: MapLayer; caption: string }) {
  return (
    <div className="legend">
      <strong>
        {layer.label} ({layer.unit})
      </strong>
      {legendItems(layer).map((it) => (
        <div key={it.label} className="legend-row">
          <span className="swatch" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
      <div className="legend-caption">{caption}</div>
    </div>
  );
}
