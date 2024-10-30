import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { format } from 'date-fns';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

type Buoy = {
  serial_number: string;
  last_measurement_timestamp: Date | null;
  latitude: number | null;
  longitude: number | null;
};


interface MapComponentProps {
  buoyData: Buoy[];
}

export default function MapComponent({ buoyData }: MapComponentProps) {

  return (
    <MapContainer center={[50.728064981302595, 18.127457151003952]} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    {buoyData.map((buoy) => {
            if (buoy.latitude !== null && buoy.longitude !== null) {
              return (
                <Marker key={buoy.serial_number} position={[50.728064981302595,18.127457151003952]}>
                  <Popup>
                    <div>
                      <p><strong>Buoy:</strong> {buoy.serial_number}</p>
                      <p><strong>Last Active:</strong> {buoy.last_measurement_timestamp ? format(new Date(buoy.last_measurement_timestamp), "PPpp") : "No data"}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            } else {
              return null; 
            }
          })}
    </MapContainer>
  );
}
