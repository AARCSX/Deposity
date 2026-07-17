import Link from "next/link";

export interface VehicleCardProps {
  id: string;
  plateNumber: string;
  vehicleType: string;
  status: "all-good" | "expiring-soon" | "expired-docs";
  driver: {
    name: string;
    phone: string;
    avatar: string;
  } | null;
  docs: {
    fit: "valid" | "expiring" | "invalid";
    perm: "valid" | "expiring" | "invalid";
    ins: "valid" | "expiring" | "invalid";
    puc: "valid" | "expiring" | "invalid";
  };
  gpsActive: boolean;
  emiDate?: string;
  locationState?: "online" | "offline";
  onEdit?: (id: string) => void;
}

export default function VehicleCard({
  id,
  plateNumber,
  vehicleType,
  status,
  driver,
  docs,
  gpsActive,
  emiDate,
  locationState = "online",
  onEdit,
}: VehicleCardProps) {
  const statusConfig = {
    "all-good": {
      label: "All Good",
      color: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
      icon: "check_circle",
    },
    "expiring-soon": {
      label: "Expiring Soon",
      color: "bg-amber-100 text-amber-800",
      icon: "warning",
    },
    "expired-docs": {
      label: "Expired Docs",
      color: "bg-error-container text-on-error-container",
      icon: "error",
    },
  };

  const docConfig = (state: "valid" | "expiring" | "invalid") => {
    switch (state) {
      case "valid":
        return "bg-tertiary";
      case "expiring":
        return "bg-warning";
      case "invalid":
        return "bg-error";
      default:
        return "bg-outline";
    }
  };

  const { label, color, icon } = statusConfig[status];

  return (
    <div
      className={`group bg-surface-container-lowest rounded-xl p-5 shadow-[0px_20px_40px_rgba(23,28,31,0.06)] border border-outline-variant/15 relative overflow-hidden transition-all hover:shadow-[0px_30px_50px_rgba(23,28,31,0.1)] ${
        status === "expired-docs" ? "border-l-4 border-l-error" : ""
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-on-background tabular-nums">{plateNumber}</h3>
            <span className="bg-surface-container-high text-on-surface-variant text-[0.65rem] uppercase font-bold px-2 py-0.5 rounded-md">
              {vehicleType}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${color}`}>
            <span className="material-symbols-outlined text-[1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
            <span className="text-xs font-bold">{label}</span>
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      {/* Driver Info */}
      <div className="bg-surface-container-low rounded-lg p-3 mb-4 flex items-center gap-3">
        {driver ? (
          <>
            <img
              alt="Driver Avatar"
              className="w-10 h-10 rounded-full object-cover border border-outline-variant/20"
              src={driver.avatar}
            />
            <div>
              <p className="text-sm font-bold text-on-background">{driver.name}</p>
              <p className="text-xs text-on-surface-variant font-medium">{driver.phone}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant bg-surface">
              <span className="material-symbols-outlined">person_off</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface-variant">Unassigned</p>
              <p className="text-xs text-on-surface-variant/70 font-medium cursor-pointer hover:text-primary transition-colors">Assign driver</p>
            </div>
          </>
        )}
      </div>

      {/* Documents Status */}
      <div className="mb-5">
        <p className="text-[0.7rem] text-on-surface-variant font-bold uppercase tracking-wider mb-2">Documents</p>
        <div className="flex justify-between items-center px-1">
          {[
            { label: "Fit", key: "fit" as const, icon: "verified" },
            { label: "Perm", key: "perm" as const, icon: "description" },
            { label: "Ins", key: "ins" as const, icon: "health_and_safety" },
            { label: "PUC", key: "puc" as const, icon: "cloud" },
          ].map((doc) => (
            <div key={doc.key} className="flex flex-col items-center gap-1">
              <div className="relative w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-outline-variant/15 text-on-surface-variant">
                <span className="material-symbols-outlined text-[1.1rem]">{doc.icon}</span>
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${docConfig(
                    docs[doc.key]
                  )}`}
                ></div>
              </div>
              <span className={`text-[0.65rem] font-medium ${docs[doc.key] === "invalid" ? "text-error font-bold" : "text-on-surface-variant"}`}>
                {doc.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Info & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
        <div className={`flex items-center gap-1.5 ${gpsActive ? "text-tertiary" : "text-on-surface-variant"}`}>
          <span className={`material-symbols-outlined text-[1.1rem] ${gpsActive ? "animate-pulse" : ""}`} style={{ fontVariationSettings: gpsActive ? "'FILL' 1" : "'FILL' 0" }}>
            {gpsActive ? "satellite_alt" : "location_off"}
          </span>
          <span className="text-xs font-bold">{gpsActive ? "GPS Active" : "GPS Offline"}</span>
          {emiDate && <span className="text-[10px] text-on-surface-variant ml-2">EMI: {emiDate}</span>}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit?.(id)}
            className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors border border-outline-variant/15"
          >
            <span className="material-symbols-outlined text-[1.1rem]">edit</span>
          </button>
          <Link 
            href={`/vehicles/${id}`}
            className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-sm transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
