import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

const mockData = [
  {
    buoy_serial_number: "B001",
    ambient_temp: 25.5,
    water_temp: 20.3,
    water_pollution: 0.05,
    lat: 50.728064981302595,
    long: 18.127457151003952,
  }
];

export default function MapComponent() {
  return (
    <MapContainer center={[50.728064981302595, 18.127457151003952]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mockData.map((data, index) => (
        <Marker key={index} position={[data.lat, data.long]}>
          <Popup>
            Buoy {data.buoy_serial_number}<br />
            Ambient Temp: {data.ambient_temp}°C<br />
            Water Temp: {data.water_temp}°C<br />
            Pollution: {data.water_pollution}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
