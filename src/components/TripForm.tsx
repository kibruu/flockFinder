"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin, Calendar, Clock, Bird, Loader2, Search } from "lucide-react";

interface Hotspot {
  id: string;
  name: string;
  locationName: string;
  habitatType: string;
}

interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  imageUrl: string | null;
  category: string;
}

interface TripFormProps {
  hotspots: Hotspot[];
  species: Species[];
  onClose: () => void;
  onCreated?: () => void;
}

export function TripForm({ hotspots, species, onClose, onCreated }: TripFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hotspotId: "",
    date: new Date().toISOString().split("T")[0],
    meetingTime: "06:00",
    meetingPoint: "",
    targetSpecies: [] as string[],
    maxParticipants: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);

  const filteredSpecies = species.filter(
    (s) =>
      s.commonName.toLowerCase().includes(speciesSearch.toLowerCase()) &&
      !formData.targetSpecies.includes(s.id)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSpeciesSelect = (speciesId: string) => {
    if (!formData.targetSpecies.includes(speciesId)) {
      setFormData((prev) => ({ ...prev, targetSpecies: [...prev.targetSpecies, speciesId] }));
      setSpeciesSearch("");
      setShowSpeciesDropdown(false);
    }
  };

  const removeSpecies = (speciesId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetSpecies: prev.targetSpecies.filter((id) => id !== speciesId),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.hotspotId) newErrors.hotspotId = "Hotspot is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.meetingTime) newErrors.meetingTime = "Meeting time is required";
    if (!formData.meetingPoint.trim()) newErrors.meetingPoint = "Meeting point is required";
    if (formData.maxParticipants) {
      const n = parseInt(formData.maxParticipants);
      if (isNaN(n) || n < 1 || n > 50) newErrors.maxParticipants = "Must be between 1 and 50";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          hotspotId: formData.hotspotId,
          date: formData.date,
          meetingTime: `${formData.date}T${formData.meetingTime}:00`,
          meetingPoint: formData.meetingPoint,
          targetSpecies: formData.targetSpecies,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onClose();
        if (onCreated) {
          onCreated();
        } else {
          router.push(`/trips/${data.id}`);
        }
      } else {
        const error = await res.json();
        setErrors({ form: error.error || "Failed to create trip" });
      }
    } catch {
      setErrors({ form: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Trip</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Cape May Spring Migration Spectacular"
              className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
              disabled={loading}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Describe the trip, target birds, difficulty level..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="hotspotId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hotspot <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="hotspotId"
                name="hotspotId"
                value={formData.hotspotId}
                onChange={handleChange}
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.hotspotId ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                disabled={loading}
              >
                <option value="">Select a hotspot...</option>
                {hotspots.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} &mdash; {h.locationName}
                  </option>
                ))}
              </select>
            </div>
            {errors.hotspotId && <p className="mt-1 text-sm text-red-500">{errors.hotspotId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.date ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  disabled={loading}
                />
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="meetingTime"
                  name="meetingTime"
                  type="time"
                  value={formData.meetingTime}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.meetingTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  disabled={loading}
                />
              </div>
              {errors.meetingTime && <p className="mt-1 text-sm text-red-500">{errors.meetingTime}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="meetingPoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meeting Point <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="meetingPoint"
                name="meetingPoint"
                type="text"
                value={formData.meetingPoint}
                onChange={handleChange}
                placeholder="e.g., Hawkwatch Platform, Cape May Point State Park"
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.meetingPoint ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                disabled={loading}
              />
            </div>
            {errors.meetingPoint && <p className="mt-1 text-sm text-red-500">{errors.meetingPoint}</p>}
          </div>

          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Participants
            </label>
            <div className="relative">
              <input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="1"
                max="50"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="Optional (e.g., 12)"
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.maxParticipants ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                disabled={loading}
              />
            </div>
            {errors.maxParticipants && <p className="mt-1 text-sm text-red-500">{errors.maxParticipants}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Species
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={speciesSearch}
                onChange={(e) => {
                  setSpeciesSearch(e.target.value);
                  setShowSpeciesDropdown(true);
                }}
                onFocus={() => setShowSpeciesDropdown(true)}
                onBlur={() => setTimeout(() => setShowSpeciesDropdown(false), 200)}
                placeholder="Search species to add..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
              {showSpeciesDropdown && filteredSpecies.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg">
                  {filteredSpecies.slice(0, 20).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSpeciesSelect(s.id)}
                      className="w-full px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-teal-900/30 flex items-center gap-2 text-sm"
                    >
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt="" className="h-5 w-5 rounded object-cover" />
                      ) : (
                        <Bird className="h-4 w-4 text-teal-500" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{s.commonName}</span>
                      <span className="text-xs text-gray-400 italic">{s.scientificName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formData.targetSpecies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.targetSpecies.map((id) => {
                  const s = species.find((sp) => sp.id === id);
                  return s ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full"
                    >
                      {s.imageUrl && <img src={s.imageUrl} alt="" className="h-4 w-4 rounded object-cover" />}
                      {s.commonName}
                      <button type="button" onClick={() => removeSpecies(id)} className="ml-1 hover:text-red-500">
                        &times;
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {errors.form && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {errors.form}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />}
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
