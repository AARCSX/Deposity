export interface TripCardProps {
  id: string;
  status: "in-transit" | "delivered" | "pending";
  origin: { name: string; date: string };
  destination: { name: string; date: string; isEstimated?: boolean };
  company: string;
  vehicle: string;
  material: string;
  driver: { name: string; avatar: string };
  financials: { total: string; advance: string; balance: string };
  onUpdateStatus?: () => void;
}

export default function TripCard({
  id,
  status,
  origin,
  destination,
  company,
  vehicle,
  material,
  driver,
  financials,
  onUpdateStatus,
}: TripCardProps) {
  const statusColors = {
    "in-transit": "bg-secondary-container text-on-secondary-container",
    delivered: "bg-tertiary-fixed text-on-tertiary-fixed",
    pending: "bg-warning/10 text-warning",
  };

  const isDelivered = status === "delivered";

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-6 flex flex-col xl:flex-row gap-6 relative border border-outline-variant/10 transition-all hover:shadow-[0px_20px_40px_rgba(23,28,31,0.06)] ${isDelivered ? "opacity-90 grayscale-[0.2]" : ""}`}>
      {/* Left: Identity & Route */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-on-surface tracking-tight">{id}</span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${statusColors[status]}`}>
              {status.replace("-", " ")}
            </span>
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        {/* Route Timeline */}
        <div className="relative pl-3 flex flex-col gap-6">
          {/* Timeline Line */}
          <div className={`absolute left-[15px] top-[14px] bottom-[14px] w-[2px] ${isDelivered ? "border-l-2 border-solid border-tertiary/30" : "border-l-2 border-dashed border-outline-variant/40"}`}></div>
          
          {/* Origin */}
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shadow-[0_0_0_4px_var(--surface-container-lowest)] ${isDelivered ? "bg-tertiary" : "bg-primary"}`}></div>
            <div>
              <div className={`text-sm font-bold ${isDelivered ? "text-on-surface/70" : "text-on-surface"}`}>{origin.name}</div>
              <div className="text-xs text-on-surface-variant">{origin.date}</div>
            </div>
          </div>
          
          {/* Destination */}
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shadow-[0_0_0_4_var(--surface-container-lowest)] border-2 ${isDelivered ? "bg-tertiary border-transparent" : "bg-surface-container-highest border-outline"}`}></div>
            <div>
              <div className={`text-sm font-bold ${isDelivered ? "text-on-surface/70" : "text-on-surface"}`}>{destination.name}</div>
              <div className={`text-xs ${destination.isEstimated ? "text-primary font-medium" : "text-on-surface-variant"}`}>
                {destination.isEstimated ? `Est. ${destination.date}` : destination.date}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Logistics Details */}
      <div className="flex-1 grid grid-cols-2 gap-4 border-t xl:border-t-0 xl:border-l border-outline-variant/15 pt-4 xl:pt-0 xl:pl-6">
        <div>
          <div className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-wider">Company</div>
          <div className="text-sm font-semibold text-on-surface">{company}</div>
        </div>
        <div>
          <div className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-wider">Vehicle</div>
          <div className="text-sm font-semibold text-on-surface flex items-center gap-2">
            {vehicle}
            <span className="material-symbols-outlined text-[16px] text-primary">local_shipping</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-wider">Material</div>
          <div className="text-sm font-semibold text-on-surface tabular-nums">{material}</div>
        </div>
        {status === "delivered" ? (
          <div className="flex items-center">
            <span className="text-xs font-medium text-tertiary bg-tertiary/10 px-2 py-1 rounded-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              POD Uploaded
            </span>
          </div>
        ) : (
          <div>
            <div className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-wider">Driver</div>
            <div className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-surface-container-highest overflow-hidden">
                <img alt="Driver" className="w-full h-full object-cover" src={driver.avatar} />
              </div>
              {driver.name}
            </div>
          </div>
        )}
      </div>

      {/* Right: Financials & Actions */}
      <div className="xl:w-[280px] flex flex-col justify-between border-t xl:border-t-0 xl:border-l border-outline-variant/15 pt-4 xl:pt-0 xl:pl-6">
        <div className="bg-surface-container-low/50 rounded-lg p-4 xl:p-0 xl:bg-transparent mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Total Freight</span>
              <span className="font-semibold tabular-nums text-on-surface">{financials.total}</span>
            </div>
            {!isDelivered && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Advance Received</span>
                <span className="font-medium tabular-nums text-tertiary">{financials.advance}</span>
              </div>
            )}
            <div className={`flex justify-between items-center text-sm pt-2 border-t border-outline-variant/15`}>
              <span className="font-medium text-on-surface">{isDelivered ? "Balance Pending" : "Balance"}</span>
              <span className={`font-bold tabular-nums ${isDelivered ? "text-error" : "text-error"}`}>{financials.balance}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {status === "delivered" ? (
            <button className="flex-1 py-2 text-sm font-bold rounded-lg bg-surface-container-highest text-on-surface hover:bg-outline-variant/30 transition-colors active:scale-[0.98]">
              Record Payment
            </button>
          ) : (
            <button 
              onClick={onUpdateStatus}
              className="flex-1 py-2 text-sm font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-[0.98]"
            >
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
