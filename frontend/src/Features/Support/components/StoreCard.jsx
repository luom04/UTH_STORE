// src/components/store/StoreCard.jsx
import { MapPin, Clock3, Navigation, PhoneCall } from "lucide-react";

export default function StoreCard({
  name,
  address,
  city,
  hours = "8:00 - 21:00",
  phone = "1900.5301",
  mapUrl = "#",
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-rose-600">
        <MapPin size={18} />
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-gray-700">
          <span className="font-semibold">Địa chỉ: </span>
          <span className="text-blue-600">{address}</span>, {city}
        </p>
        <p className="flex items-center gap-2 text-gray-700">
          <Clock3 size={16} className="text-gray-500" />
          <span className="font-semibold">Giờ làm việc:</span>
          <span>{hours}</span>
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <a
          href={`tel:${phone.replace(/\D/g, "")}`}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-white shadow hover:bg-emerald-600"
        >
          <PhoneCall size={16} />
          Gọi {phone}
        </a>
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100"
        >
          <Navigation size={16} />
          Chỉ đường
        </a>
      </div>
    </div>
  );
}
