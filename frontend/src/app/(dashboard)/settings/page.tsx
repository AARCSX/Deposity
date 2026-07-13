"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getOrgNameFromToken, authenticatedFetch } from "@/lib/api";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("OnWay");
  const [profile, setProfile] = useState({
    name: "",
    logo: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    email: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadSettings = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await authenticatedFetch("/settings");
      if (!response.ok) {
        throw new Error("Failed to load organization settings profile");
      }
      const data = await response.json();
      setProfile({
        name: data.name || "",
        logo: data.logo || "",
        gstNumber: data.gstNumber || "",
        panNumber: data.panNumber || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || ""
      });
      if (data.name) {
        setOrgName(data.name);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while fetching settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authenticatedFetch("/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }
      const updated = await response.json();
      
      // Update local storage override and dispatch event for sidebar/header updates
      if (updated.name) {
        localStorage.setItem("deposity_org_name", updated.name);
        window.dispatchEvent(new Event("deposity_org_name_changed"));
        setOrgName(updated.name);
      }
      
      setSuccessMsg("Settings updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h2 className="text-[2.75rem] font-black tracking-tighter text-on-surface leading-tight mb-2">Business Settings</h2>
          <p className="text-on-surface-variant font-medium text-sm leading-relaxed max-w-2xl">
            Configure your logistics hub parameters, manage team access, and tailor notification preferences for seamless operations.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 font-bold text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20 font-bold text-sm animate-pulse">
            {successMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Vertical Tabs */}
          <nav className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
            <SettingsTab icon="business_center" label="Business Profile" active />
            <SettingsTab icon="group" label="User Management" />
            <SettingsTab icon="settings_suggest" label="Vehicle Settings" />
            <SettingsTab icon="notifications_active" label="Notification Settings" />
            <SettingsTab icon="card_membership" label="Subscription" />
          </nav>

          {/* Settings Content: Business Profile */}
          <div className="flex-1 w-full space-y-8">
            <div className="bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-on-surface">Organization Identity</h3>
                  <p className="text-sm text-on-surface-variant mt-1 font-medium">This information will be used for legal documentation and invoice generation.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button 
                    onClick={loadSettings}
                    disabled={isSaving}
                    className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-on-surface-variant bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-gradient-to-br from-primary to-primary-container rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Branding Section */}
                <div className="md:col-span-2 flex items-center gap-8 p-8 bg-surface-container-low/50 rounded-3xl border-2 border-dashed border-outline-variant/20">
                  <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-outline-variant/10 shrink-0">
                    <Image
                      src={profile.logo || "https://lh3.googleusercontent.com/aida-public/AB6AXuCaFrJ0vQXaSD5RPwSssWXMHsoN64FYGSTdcbYKyY6vkbRUJjvEko0q2Ecew2195s4J8Da8OfOGwPf3PjOQFm40d6fnRlrgrjLEZMuxIdk13YG4svuVQ-c5m2wDZd2KbBpx1oBAwg8hlCfG5U9JakqxzU1goH9z-JYhOA8yJ1a3GaHWtRICvy8VfamTMtFParLpDKeiST9FIPqKG8WQhwlmgmljoFRx-ZarfSzsVJ6RAexDxDF7tNIq73rj4jr03Bh75YEBUVTfmuKl"}
                      alt="Organization Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">Company Branding</h4>
                    <p className="text-xs text-on-surface-variant mb-4 font-medium leading-relaxed">Provide a logo image URL to configure organization brand logo.</p>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="Logo image URL"
                        value={profile.logo} 
                        onChange={(e) => handleInputChange("logo", e.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl py-2 px-3 text-on-surface text-xs outline outline-1 outline-outline-variant/15 shadow-inner"
                      />
                      {profile.logo && (
                        <button 
                          onClick={() => handleInputChange("logo", "")} 
                          className="text-[10px] font-black uppercase tracking-widest text-error px-4 py-2 hover:bg-error/5 rounded-lg transition-all self-start"
                        >
                          Remove Logo URL
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <SettingsInput 
                  label="Legal Business Name / Brand Name" 
                  value={profile.name} 
                  onChange={(val: string) => handleInputChange("name", val)}
                />
                <SettingsInput 
                  label="GST Registration Number" 
                  value={profile.gstNumber} 
                  onChange={(val: string) => handleInputChange("gstNumber", val)}
                  uppercase 
                  tabular 
                />
                <SettingsInput 
                  label="PAN Card Number" 
                  value={profile.panNumber} 
                  onChange={(val: string) => handleInputChange("panNumber", val)}
                  uppercase 
                  tabular 
                />
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[0.65rem] font-black uppercase tracking-widest text-outline ml-2">Registered Headquarters Address</label>
                  <textarea 
                    className="w-full bg-surface-container-highest border-none rounded-2xl py-4 px-5 text-on-surface font-bold text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline outline-1 outline-outline-variant/15 resize-none shadow-inner" 
                    rows={3}
                    value={profile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter registered business address..."
                  />
                </div>

                <SettingsInput 
                  label="Primary Support Email" 
                  value={profile.email} 
                  onChange={(val: string) => handleInputChange("email", val)}
                  type="email" 
                />
                <SettingsInput 
                  label="Primary Contact Number" 
                  value={profile.phone} 
                  onChange={(val: string) => handleInputChange("phone", val)}
                  tabular 
                />
              </div>

              {/* Info Alert */}
              <div className="mt-12 p-6 bg-secondary-fixed text-on-secondary-fixed-variant rounded-3xl flex items-start gap-5 border border-primary/5 shadow-sm">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <div className="text-xs leading-relaxed">
                  <p className="font-black uppercase tracking-widest mb-1 text-[10px]">Verify Regulatory Information</p>
                  <p className="font-medium opacity-80">Updating GST or PAN details will trigger a re-verification process which might take up to 48 hours. During this period, some billing features may be restricted.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-on-surface-variant font-medium">© 2026 {orgName} Depo. All rights reserved. Powered by AARCSX Deposity.</p>
          <div className="flex gap-6">
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Privacy Policy</a>
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Support Portal</a>
          </div>
        </footer>
      </div>
    </>
  );
}

function SettingsTab({ icon, label, active }: any) {
  return (
    <button className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 border-l-4 ${active ? 'bg-surface-container-lowest shadow-lg shadow-black/5 text-primary border-primary' : 'text-on-surface-variant hover:bg-surface-container-low border-transparent'}`}>
      <span className={`material-symbols-outlined ${active ? '' : 'opacity-60'}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "" }}>{icon}</span>
      {label}
    </button>
  );
}

function SettingsInput({ label, value, type = "text", uppercase, tabular, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[0.65rem] font-black uppercase tracking-widest text-outline ml-2">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-surface-container-highest border-none rounded-2xl py-4 px-5 text-on-surface font-bold text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline outline-1 outline-outline-variant/15 shadow-inner ${uppercase ? 'uppercase' : ''} ${tabular ? 'tabular-nums' : ''}`}
      />
    </div>
  );
}
