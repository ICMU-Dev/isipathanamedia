import React, { useState } from "react";
import {
  Share2,
  PhoneCall,
  Users,
  Trash2,
  MoveUp,
  MoveDown,
  ScrollText,
  Layers,
  ExternalLink,
  Plus,
  SearchX,
} from "lucide-react";

const ConfigFormEditor = ({
  config = {},
  onChange,
  searchQuery = "",
  parentTab = "general",
}) => {
  const safeConfig = config || {};

  const query = searchQuery.trim().toLowerCase();

  const matchesSearch = (sectionKey, labels = []) => {
    if (!query) return true;
    if (sectionKey.toLowerCase().includes(query)) return true;
    return labels.some(
      (label) => label && String(label).toLowerCase().includes(query),
    );
  };

  // Social Links Handlers
  const handleSocialChange = (key, value) => {
    onChange({
      ...safeConfig,
      socialLinks: {
        ...(safeConfig.socialLinks || {}),
        [key]: value,
      },
    });
  };

  // Contact Info Handlers
  const handleContactChange = (key, value) => {
    onChange({
      ...safeConfig,
      contactDetails: {
        ...(safeConfig.contactDetails || {}),
        [key]: value,
      },
    });
  };

  // Phone formatting helper
  const formatPhone = (val) => {
    if (!val) return "";
    let digits = val.replace(/\D/g, "");
    if (digits.length === 0) return val.includes("+") ? "+" : "";
    if (digits.startsWith("0")) digits = "94" + digits.substring(1);
    
    let formatted = "+";
    if (digits.length > 0) formatted += digits.substring(0, 2);
    if (digits.length > 2) formatted += " " + digits.substring(2, 4);
    if (digits.length > 4) formatted += " " + digits.substring(4, 7);
    if (digits.length > 7) formatted += " " + digits.substring(7, 11);
    return formatted;
  };

  const formatWhatsapp = (val) => {
    if (!val) return "";
    let digits = val.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "94" + digits.substring(1);
    return digits.substring(0, 11);
  };

  // Leadership Officers Handlers
  const handleLeadershipChange = (index, key, value) => {
    let formattedValue = value;
    if (key === "phone") {
      formattedValue = formatPhone(value);
    } else if (key === "whatsapp") {
      formattedValue = formatWhatsapp(value);
    }

    const leadership = [...(safeConfig.contactDetails?.leadership || [])];
    leadership[index] = { ...leadership[index], [key]: formattedValue };
    onChange({
      ...safeConfig,
      contactDetails: {
        ...(safeConfig.contactDetails || {}),
        leadership,
      },
    });
  };

  const addLeadershipMember = () => {
    const leadership = [...(safeConfig.contactDetails?.leadership || [])];
    const newId = leadership.length
      ? Math.max(...leadership.map((l) => l.id || 0)) + 1
      : 1;
    leadership.push({
      id: newId,
      name: "",
      role: "",
      phone: "",
      whatsapp: "",
    });
    onChange({
      ...safeConfig,
      contactDetails: {
        ...(safeConfig.contactDetails || {}),
        leadership,
      },
    });
  };

  const removeLeadershipMember = (index) => {
    const leadership = [...(safeConfig.contactDetails?.leadership || [])];
    leadership.splice(index, 1);
    onChange({
      ...safeConfig,
      contactDetails: {
        ...(safeConfig.contactDetails || {}),
        leadership,
      },
    });
  };

  // Section Sequence Handlers
  const moveSection = (index, direction) => {
    const sections = [...(safeConfig.sectionOrder || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;
    onChange({ ...safeConfig, sectionOrder: sections });
  };

  // Gather searchable labels
  const officerLabels = (safeConfig.contactDetails?.leadership || []).flatMap(
    (m) => [m.name, m.role, m.phone, m.whatsapp],
  );
  const sectionLabels = safeConfig.sectionOrder || [];

  const showSocial = matchesSearch("social", [
    "facebook",
    "instagram",
    "youtube",
    "twitter",
    "links",
    safeConfig.socialLinks?.facebook,
    safeConfig.socialLinks?.instagram,
    safeConfig.socialLinks?.youtube,
    safeConfig.socialLinks?.twitter,
  ]);

  const showContact = matchesSearch("contact", [
    "address",
    "email",
    "leadership",
    "officer",
    "team",
    safeConfig.contactDetails?.address,
    safeConfig.contactDetails?.email,
    ...officerLabels,
  ]);

  const showSections = matchesSearch("sections", [
    "layout",
    "order",
    "sequence",
    "homepage",
    ...sectionLabels,
  ]);
  const anySectionVisible =
    (parentTab === "general" && (showSocial || showContact)) ||
    (parentTab === "content" && showSections);

  return (
    <div className="space-y-2 animate-fade-in">
      {!anySectionVisible ? (
        <div className=" border-theme rounded-2xl p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto text-white/30">
            <SearchX size={20} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-white/80">
              No matching settings found
            </h3>
            <p className="text-[11px] text-white/40 mt-1 max-w-sm mx-auto">
              No configuration parameter matches{" "}
              <span className="text-white/80 font-mono">"{query}"</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* 1. SOCIAL MEDIA LINKS */}
          {parentTab === "general" && showSocial && (
            <section className="py-6 border-b border-white/[0.06]  last:border-0 space-y-6">
              <div className="flex items-center gap-2.5 pb-2">
                <Share2 size={16} className="text-white/40" />
                <div>
                  <h2 className="text-[14px] font-bold text-white tracking-wide">
                    Social Media Links
                  </h2>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Links displayed across header, footer, and social bar
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(
                  new Set([
                    "facebook",
                    "instagram",
                    "youtube",
                    "twitter",
                    "tiktok",
                    "linkedin",
                    ...Object.keys(safeConfig.socialLinks || {}),
                  ]),
                ).map((key) => {
                  const label =
                    key.charAt(0).toUpperCase() + key.slice(1) + " URL";
                  const placeholder = `https://${key}.com/...`;
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`social-${key}`}
                          className="text-[10px] font-bold text-white/50 ml-1 uppercase tracking-wider">
                          {label}
                        </label>
                        {safeConfig.socialLinks?.[key] && (
                          <a
                            href={safeConfig.socialLinks[key]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 transition-colors uppercase font-bold tracking-wider">
                            Visit <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <input
                        id={`social-${key}`}
                        type="url"
                        value={safeConfig.socialLinks?.[key] || ""}
                        onChange={(e) =>
                          handleSocialChange(key, e.target.value)
                        }
                        placeholder={placeholder}
                        className="w-full bg-white/[0.02] border border-white/[0.06]  focus:border-[var(--accent)] focus:bg-white/[0.04] rounded-2xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none transition-all shadow-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. CONTACT INFORMATION & LEADERSHIP */}
          {parentTab === "general" && showContact && (
            <section className="py-6 border-b border-white/[0.06]  last:border-0 space-y-6">
              <div className="flex items-center gap-2.5 pb-2">
                <PhoneCall size={16} className="text-white/40" />
                <div>
                  <h2 className="text-[14px] font-bold text-white tracking-wide">
                    Contact Details & Executive Officers
                  </h2>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Primary contact info and leadership roster
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label
                    htmlFor="contact-address"
                    className="text-[10px] font-bold text-white/50 ml-1 uppercase tracking-wider">
                    Office Address
                  </label>
                  <input
                    id="contact-address"
                    type="text"
                    value={safeConfig.contactDetails?.address || ""}
                    onChange={(e) =>
                      handleContactChange("address", e.target.value)
                    }
                    placeholder="e.g. Isipathana College, Colombo 05, Sri Lanka"
                    className="w-full bg-white/[0.02] border border-white/[0.06]  focus:border-[var(--accent)] focus:bg-white/[0.04] rounded-2xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="text-[10px] font-bold text-white/50 ml-1 uppercase tracking-wider">
                    Primary Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={safeConfig.contactDetails?.email || ""}
                    onChange={(e) =>
                      handleContactChange("email", e.target.value)
                    }
                    placeholder="e.g. icmediaunit@gmail.com"
                    className="w-full bg-white/[0.02] border border-white/[0.06]  focus:border-[var(--accent)] focus:bg-white/[0.04] rounded-2xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Executive Officers */}
              <div className="space-y-4 pt-4 mt-2 border-t border-white/[0.06] ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-white/40" />
                    <h3 className="text-[13px] font-bold text-white/80">
                      Executive Officers (
                      {safeConfig.contactDetails?.leadership?.length || 0})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={addLeadershipMember}
                    className="px-3 py-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors uppercase tracking-wider">
                    <Plus size={12} strokeWidth={2.5} /> Add Officer
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {(safeConfig.contactDetails?.leadership || []).map(
                    (member, idx) => (
                      <div
                        key={member.id || idx}
                        className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.06]  space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => removeLeadershipMember(idx)}
                          className="absolute top-3 right-3 p-1.5 text-white/20 hover:text-red-400 rounded-full hover:bg-red-600/10 transition-colors"
                          title="Remove">
                          <Trash2 size={14} />
                        </button>

                        <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                          Officer #{idx + 1}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label
                              htmlFor={`officer-name-${idx}`}
                              className="text-[9px] font-bold text-white/40 uppercase tracking-wider ml-1">
                              Name
                            </label>
                            <input
                              id={`officer-name-${idx}`}
                              type="text"
                              value={member.name || ""}
                              onChange={(e) =>
                                handleLeadershipChange(
                                  idx,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-black/20 border border-white/[0.06]  focus:border-[var(--accent)] rounded-2xl px-3 py-2 text-[12px] text-white focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`officer-role-${idx}`}
                              className="text-[9px] font-bold text-white/40 uppercase tracking-wider ml-1">
                              Role
                            </label>
                            <input
                              id={`officer-role-${idx}`}
                              type="text"
                              value={member.role || ""}
                              onChange={(e) =>
                                handleLeadershipChange(
                                  idx,
                                  "role",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-black/20 border border-white/[0.06]  focus:border-[var(--accent)] rounded-2xl px-3 py-2 text-[12px] text-white focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`officer-phone-${idx}`}
                              className="text-[9px] font-bold text-white/40 uppercase tracking-wider ml-1">
                              Phone
                            </label>
                            <input
                              id={`officer-phone-${idx}`}
                              type="tel"
                              placeholder="+94 77 123 4567"
                              value={member.phone || ""}
                              onChange={(e) =>
                                handleLeadershipChange(
                                  idx,
                                  "phone",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-black/20 border border-white/[0.06]  focus:border-[var(--accent)] rounded-2xl px-3 py-2 text-[12px] text-white focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`officer-wa-${idx}`}
                              className="text-[9px] font-bold text-white/40 uppercase tracking-wider ml-1">
                              WhatsApp
                            </label>
                            <input
                              id={`officer-wa-${idx}`}
                              type="tel"
                              placeholder="94771234567"
                              value={member.whatsapp || ""}
                              onChange={(e) =>
                                handleLeadershipChange(
                                  idx,
                                  "whatsapp",
                                  e.target.value,
                                )
                              }
                              className="w-full bg-black/20 border border-white/[0.06]  focus:border-[var(--accent)] rounded-2xl px-3 py-2 text-[12px] text-white focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>
          )}        {/* 4. HOMEPAGE SECTION SEQUENCE */}
          {parentTab === "content" && showSections && (
            <section className="py-6 border-b border-white/[0.06]  last:border-0 space-y-6">
              <div className="flex items-center gap-2.5 pb-2">
                <Layers size={16} className="text-white/40" />
                <div>
                  <h2 className="text-[14px] font-bold text-white tracking-wide">
                    Homepage Layout Sequence
                  </h2>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Reorder top-to-bottom section arrangement
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(safeConfig.sectionOrder || []).map((sectionName, idx) => (
                  <div
                    key={sectionName}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]  flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded bg-black/40 text-white/40 font-mono text-[10px] flex items-center justify-center border border-white/[0.06] ">
                        {idx + 1}
                      </span>
                      <span className="text-[12px] font-bold text-white/80 capitalize tracking-wide">
                        {sectionName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, -1)}
                        className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Up">
                        <MoveUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={
                          idx === (safeConfig.sectionOrder?.length || 1) - 1
                        }
                        onClick={() => moveSection(idx, 1)}
                        className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Down">
                        <MoveDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigFormEditor;
