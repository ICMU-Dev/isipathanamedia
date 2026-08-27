import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Camera,
  Search,
  Upload,
  Users,
  AlertTriangle,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import { toast } from "sonner";
import { MorphingModal } from "../../components/motion/morphing-modal";

const ManageTeam = () => {
  const {
    team,
    addMember,
    updateMember,
    deleteMember,
    uploadImage,
    fetchTeam,
  } = useData();

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalView, setModalView] = useState("options"); // 'options' | 'edit' | 'confirm-delete'

  const handleEdit = (member) => {
    setIsEditing(true);
    setCurrentUser(member);
    setFormData({
      name: member.name,
      role: member.role,
      image: member.image,
    });
    setModalView("options");
  };

  const handleDelete = async (id) => {
    await deleteMember(id);
    toast.success("Member removed successfully.");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await uploadImage(file, "profile images");
      if (publicUrl) {
        setFormData((prev) => ({ ...prev, image: publicUrl }));
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentUser) {
        await updateMember(currentUser.id, formData);
        toast.success("Member updated successfully.");
      } else {
        await addMember(formData);
        toast.success("Member added successfully.");
      }
      setIsEditing(false);
      setCurrentUser(null);
      setFormData({ name: "", role: "", image: "" });
      setModalView("options");
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setCurrentUser(null);
    setFormData({ name: "", role: "", image: "" });
    setModalView("edit");
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setTimeout(() => {
      setCurrentUser(null);
      setModalView("options");
    }, 200); // give time for exit animation
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-h-screen pt-2 sm:pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-4 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--admin-text-primary)]">
            Team Members
          </h1>
          <p className="text-[11px] sm:text-sm text-[var(--admin-text-secondary)] mt-0.5">
            Manage your executive board
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--admin-text-secondary)]">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] rounded-2xl pl-9 pr-3 py-2 text-[13px] text-[var(--admin-text-primary)] placeholder-white/30 focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-[var(--accent)] text-black hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-theme-accent/10 font-bold rounded-2xl shrink-0 text-[13px]">
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      <MorphingModal
        viewId={isEditing ? modalView : null}
        onClose={handleCloseModal}>
        <div className="w-full sm:min-w-[340px] bg-theme-card  flex flex-col max-h-[85vh] overflow-hidden relative rounded-3xl  border border-[var(--admin-border)] p-5">
          {modalView === "options" && currentUser && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--admin-border)]">
                <h3 className="font-bold text-[var(--admin-text-primary)] tracking-wide text-sm">
                  {currentUser.name}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] bg-[var(--admin-input-bg)] hover:bg-[var(--admin-card-bg)] rounded-full p-1.5 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <button
                onClick={() => setModalView("edit")}
                className="w-full p-3.5 rounded-2xl border border-[var(--admin-border)] hover:border-white/20 bg-[var(--admin-input-bg)] hover:bg-[var(--admin-card-bg)] flex items-center gap-3 text-[var(--admin-text-primary)] transition-all text-sm font-medium">
                <Edit2 size={16} className="opacity-70" />
                Edit Member
              </button>

              <button
                onClick={() => setModalView("confirm-delete")}
                className="w-full p-3.5 rounded-2xl border border-red-600/20 hover:border-red-600/40 bg-red-600/10 hover:bg-red-600/20 flex items-center gap-3 text-red-600 transition-all text-sm font-medium">
                <Trash2 size={16} className="opacity-70" />
                Delete Member
              </button>
            </div>
          )}

          {modalView === "confirm-delete" && currentUser && (
            <div className="flex flex-col gap-4 text-center items-center py-2">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center text-red-600 mb-2 border border-red-600/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--admin-text-primary)] text-lg">Remove Member?</h3>
                <p className="text-[var(--admin-text-secondary)] text-sm mt-1 px-4">
                  This action cannot be undone. Are you sure you want to remove{" "}
                  <strong className="text-[var(--admin-text-primary)]">{currentUser.name}</strong>?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setModalView("options")}
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-[var(--admin-input-bg)] hover:bg-[var(--admin-card-bg)] text-[var(--admin-text-secondary)] text-sm font-bold transition-all disabled:opacity-50 border border-[var(--admin-border)]">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(currentUser.id);
                    setIsEditing(false);
                  }}
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-[var(--admin-text-primary)] text-sm font-bold transition-all hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-600/20">
                  {saving ? "Deleting..." : "Yes, Remove"}
                </button>
              </div>
            </div>
          )}

          {(modalView === "edit" || !currentUser) && (
            <div className="flex flex-col">
              <div className="flex justify-between items-center p-2 pb-1 border-b border-transparent">
                <h3 className="text-[14px] font-bold text-[var(--admin-text-primary)] tracking-wide">
                  {currentUser ? "Edit Member" : "Add Member"}
                </h3>
                <button
                  onClick={() => {
                    if (currentUser) {
                      setModalView("options");
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] bg-[var(--admin-input-bg)] hover:bg-[var(--admin-card-bg)] rounded-full p-1.5 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="p-2 overflow-y-auto hide-scrollbar">
                <form
                  id="member-form"
                  onSubmit={handleSave}
                  className="space-y-4">
                  {/* 3:4 Live Card Preview */}
                  <div className="flex justify-center mb-6 mt-2">
                    <div className="relative w-[140px] rounded-2xl border border-theme-base bg-theme-card overflow-hidden group shadow-xl">
                      <div className="w-full aspect-[3/4] relative bg-black/40">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-secondary)] transition-colors">
                            <Camera size={24} />
                          </div>
                        )}

                        {uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader
                              className="text-[var(--accent)]"
                              size="sm"
                            />
                          </div>
                        )}

                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm">
                          <Upload size={20} className="text-[var(--admin-text-primary)] mb-2" />
                          <span className="text-[10px] font-bold text-[var(--admin-text-primary)] uppercase tracking-wider">
                            Upload Image
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading || saving}
                          />
                        </label>
                      </div>

                      <div className="p-3 text-center border-t border-[var(--admin-border)] bg-gradient-to-b from-transparent to-black/40">
                        <div className="text-[12px] font-bold text-[var(--admin-text-primary)] truncate px-1">
                          {formData.name || "Member Name"}
                        </div>
                        <div className="text-[9px] font-bold text-[var(--admin-text-secondary)] truncate uppercase tracking-widest mt-1">
                          {formData.role || "Position"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Inputs */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--admin-text-secondary)] ml-1 uppercase tracking-wider">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-[var(--accent)] focus:bg-[var(--admin-input-bg)] rounded-2xl px-3 py-2 text-[13px] text-[var(--admin-text-primary)] placeholder-white/20 focus:outline-none transition-all shadow-sm"
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--admin-text-secondary)] ml-1 uppercase tracking-wider">
                        Role
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="w-full bg-[var(--admin-input-bg)] border border-[var(--admin-border)] focus:border-[var(--accent)] focus:bg-[var(--admin-input-bg)] rounded-2xl px-3 py-2 text-[13px] text-[var(--admin-text-primary)] placeholder-white/20 focus:outline-none transition-all shadow-sm"
                        placeholder="e.g. President"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-2 pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      setModalView("options");
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  disabled={saving || uploading}
                  className="flex-[0.4] py-3 rounded-2xl text-[13px] font-semibold text-[var(--admin-text-secondary)] bg-[var(--admin-input-bg)] hover:bg-[var(--admin-card-bg)] hover:text-[var(--admin-text-primary)] transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  form="member-form"
                  disabled={saving || uploading}
                  className="flex-1 py-3 rounded-2xl text-[13px] font-bold text-black bg-[var(--accent)] hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-theme-accent/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5">
                  {saving ? (
                    <>
                      <Loader
                        size="sm"
                        className="text-current"
                      />{" "}
                      Saving
                    </>
                  ) : (
                    "Save Member"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </MorphingModal>

      {/* Grid */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
        {team
          .filter(
            (member) =>
              member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              member.role.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-theme-base flex flex-row sm:flex-col overflow-hidden admin-card hover:scale-105 transition-all group shadow-lg p-3 sm:p-0 gap-4 sm:gap-0">
              {/* Image Section */}
              <div className="w-20 h-20 sm:w-full [&:not(:hover)]:opacity-75  hover:opacity-100 sm:h-auto sm:aspect-[3/4] sm:min-h-[220px] bg-[var(--admin-input-bg)] relative overflow-hidden rounded-2xl sm:rounded-none shrink-0 border border-theme-base sm:border-none">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top sm:group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-secondary)]">
                    <Users size={24} className="sm:w-8 sm:h-8 opacity-50" />
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className="flex-1 sm:p-5 flex flex-col justify-center sm:justify-between min-w-0">
                <div className="flex flex-col min-w-0 flex-1 pr-2 sm:pr-0">
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-theme-primary opacity-90 mb-0.5 truncate">
                    {member.name}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] font-medium text-theme-primary opacity-40 truncate uppercase tracking-wide">
                    {member.role}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center mt-3 sm:mt-4 w-full">
                  <button
                    onClick={() => handleEdit(member)}
                    className="w-full px-3 py-1.5 sm:py-2 flex items-center justify-center rounded-2xl bg-[var(--admin-input-bg)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-card-bg)] transition-colors text-[11px] sm:text-xs font-bold uppercase tracking-wider"
                    title="Edit Member">
                    <Edit2 size={12} className="mr-1.5" strokeWidth={2.5} />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {team.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-theme-base rounded-2xl admin-card">
          <div className="w-12 h-12 rounded-full admin-input border-theme flex items-center justify-center mb-4 text-theme-primary opacity-20">
            <Users size={24} />
          </div>
          <p className="text-sm font-medium text-theme-primary">
            No members found
          </p>
          <p className="text-xs text-theme-primary opacity-40 mt-1">
            Add a new member to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageTeam;
