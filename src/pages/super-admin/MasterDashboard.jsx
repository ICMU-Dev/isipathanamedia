import { Skeleton } from "../../components/ui/skeleton";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  ShieldAlert,
  Users,
  Plus,
  Globe,
  ShieldCheck,
  LogOut,
  Key,
  List,
  LayoutGrid,
  ArrowRight,
  ExternalLink,
  Activity,
  BookOpen,
  Database,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import SystemDocumentation from "./SystemDocumentation";
import DatabaseStatus from "./components/DatabaseStatus";
import AddUserModal from "./components/AddUserModal";
import EditUserModal from "./components/EditUserModal";
import UserTableView from "./components/UserTableView";
import UserCardGrid from "./components/UserCardGrid";
import RoleGuidelinesModal from "./components/RoleGuidelinesModal";

import { AnimatedNumber } from "../../components/motion/animated-number";
import {
  canAccessSuperAdminDashboard,
  canAccessHub,
  isAdmin,
  isSuperAdmin,
  isBroadcaster,
  getDefaultDashboardPath,
  formatStoredRole,
  getBroadcasterAdminUrl,
} from "../../utils/roles";

const TabButton = ({ value, label, activeTab, onClick, icon: Icon }) => (
  <button
    onClick={() => onClick(value)}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-2xl text-[11px] sm:text-sm font-semibold transition-all duration-300 ${
      activeTab === value
        ? "bg-white text-black shadow-md"
        : "text-zinc-400 hover:text-white hover:bg-white/5"
    }`}>
    <Icon size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
    <span className="whitespace-nowrap">{label}</span>
  </button>
);

const Card = ({ title, description, linkTo, btnTitle, icon: Icon, disabled, external }) => {
  const isExternal = external || (typeof linkTo === 'string' && linkTo.startsWith('http'));
  return (
    <div className={`group relative rounded-2xl overflow-hidden bg-[#09090b] transition-all duration-500 shadow-xl shadow-black/50 border border-white/[0.06]  ${disabled ? 'opacity-50 grayscale' : 'hover:shadow-2xl hover:border-white/20'}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/10 transition-all duration-700"></div>
      <div className="relative p-5 sm:p-8 flex flex-col h-full z-10">
        <div className="mb-5 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 bg-white/5 border border-white/5 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md">
            <Icon
              size={24}
              strokeWidth={1.5}
              className="sm:w-[28px] sm:h-[28px]"
            />
          </div>
          <h3 className="text-xl sm:text-3xl font-semibold text-white tracking-tight leading-tight mb-2 sm:mb-3">
            {title}
          </h3>
          <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-[280px]">
            {description}
          </p>
        </div>
        <div className="mt-auto pt-5 sm:pt-6 border-t border-white/[0.06] ">
          {disabled ? (
            <div className="w-full py-3.5 sm:py-4 px-5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold bg-white/5 border border-white/5 text-zinc-500 cursor-not-allowed">
              <span className="uppercase tracking-widest">OFFLINE</span>
            </div>
          ) : isExternal ? (
            <a
              href={linkTo}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 sm:py-4 px-5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold transition-all duration-300 bg-white/5 border border-white/5 text-white hover:bg-white hover:text-black hover:border-white/5">
              <span className="uppercase tracking-widest">{btnTitle}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-black/20 transform group-hover:translate-x-1 transition-all duration-300">
                <ExternalLink size={14} className="sm:w-[16px] sm:h-[16px]" />
              </div>
            </a>
          ) : (
            <Link
              to={linkTo}
              className="w-full py-3.5 sm:py-4 px-5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold transition-all duration-300 bg-white/5 border border-white/5 text-white hover:bg-white hover:text-black hover:border-white/5">
              <span className="uppercase tracking-widest">{btnTitle}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-black/20 transform group-hover:translate-x-1 transition-all duration-300">
                <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon: Icon, color, className = "" }) => (
  <div
    className={`bg-[#09090b] border border-white/[0.06]  rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 relative overflow-hidden shadow-lg ${className}`}>
    <div
      className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl sm:rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${color} shadow-sm`}>
      <Icon size={18} strokeWidth={2} className="w-4 h-4 sm:w-5 sm:h-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate">
        {label}
      </div>
    </div>
  </div>
);

const MasterDashboard = () => {
  const { adminPath } = useParams();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("card");
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    index_number: "",
    role: "admin",
  });

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState({ id: null, full_name: "" });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isRoleGuideModalOpen, setIsRoleGuideModalOpen] = useState(false);
  
  // Hidden dev mode toggle
  const [devClicks, setDevClicks] = useState(0);

  useEffect(() => {
    if (devClicks >= 5) {
      localStorage.setItem("icmu_dev_mode", "true");
      window.dispatchEvent(new Event("icmu_dev_mode_toggled"));
      setDevClicks(0); // Reset after activating
    }
  }, [devClicks]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const basePath = `/${adminPath}`;

  const isSuper = isSuperAdmin(user?.role);
  const isAuthorized = canAccessHub(user?.role);

  useEffect(() => {
    if (isSuper && activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, isSuper]);

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in px-4">
        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center border border-red-600/20 mb-4 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={36} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Access Denied
        </h2>
        <p className="text-zinc-400 text-sm max-w-sm">
          You do not have the required clearance level to access this terminal.
        </p>
        <Link
          to={getDefaultDashboardPath(user?.role, adminPath)}
          className="mt-8 px-8 py-3.5 bg-white text-black hover:bg-zinc-200 font-semibold rounded-full transition-all shadow-md hover:shadow-lg">
          Return Home
        </Link>
      </div>
    );
  }

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.index_number) return;

    try {
      const formattedRole = formatStoredRole(newUser.role || "admin");
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            full_name: newUser.full_name,
            index_number: newUser.index_number,
            role: formattedRole,
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;

      setUsers((prev) => [data[0], ...prev]);
      setNewUser({ full_name: "", index_number: "", role: "admin" });
      setIsAddUserModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert(`Failed to add user: ${error.message}`);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.full_name) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: editingUser.full_name })
        .eq("id", editingUser.id);

      if (error) throw error;

      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, full_name: editingUser.full_name }
            : u,
        ),
      );
      setIsEditUserModalOpen(false);
    } catch (error) {
      alert(`Rename failed: ${error.message}`);
    }
  };

  const handleResetPassword = async (id) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    const tempPassword = window.prompt(
      `Set a new temporary password for "${targetUser.full_name}":\n(min 6 characters)`,
    );
    if (!tempPassword) return;
    if (tempPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("set_user_password", {
        p_index_number: targetUser.index_number,
        p_password: tempPassword,
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || "Reset failed.");
      alert(
        `Password reset for "${targetUser.full_name}".\nTemporary password: ${tempPassword}\nPlease inform the user to change it immediately.`,
      );
    } catch (error) {
      alert(`Password reset failed: ${error.message}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this user's access permanently?",
      )
    )
      return;
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = currentStatus === false ? true : false;
    const action = newStatus ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: newStatus })
        .eq("id", id);
      if (error) throw error;
      setUsers(
        users.map((u) => (u.id === id ? { ...u, is_active: newStatus } : u)),
      );
    } catch (error) {
      alert(`Failed to ${action} user: ${error.message}`);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    const formattedRole = formatStoredRole(newRole);
    try {
      setUsers(users.map((u) => (u.id === id ? { ...u, role: formattedRole } : u)));
      const { error } = await supabase
        .from("users")
        .update({ role: formattedRole })
        .eq("id", id);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      alert(`Role update failed: ${error.message}`);
      fetchUsers();
    }
  };

  const totalUsers = users.length;
  const activeAdmins = users.filter(
    (u) =>
      u.is_active !== false && (isAdmin(u.role) || isBroadcaster(u.role)),
  ).length;
  const localAuthCount = users.filter((u) => !u.email).length;

  const handleEditUserClick = (userToEdit) => {
    setEditingUser({
      id: userToEdit.id,
      full_name: userToEdit.full_name,
    });
    setIsEditUserModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] w-full text-zinc-100 font-sans relative">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-12 space-y-8 sm:space-y-10 animate-fade-in pb-32">
        {/* Modern Airy Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-2 mb-2" onClick={() => setDevClicks((c) => c + 1)}>
              <ShieldCheck size={16} className="text-white" />
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-bold select-none cursor-default">
                ICMU Portal
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
              Welcome, <br className="sm:hidden" />
              <span className="text-white font-bold">
                {user?.name?.split(" ")[0] || (isSuper ? "Admin" : "Operator")}
              </span>
            </h2>
            <p className="text-zinc-500 font-medium text-sm sm:text-base max-w-sm mt-2">
              {isSuper
                ? "Manage the global state and security architecture."
                : "Dual clearance operations hub. Select a terminal to begin."}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center text-red-600 hover:bg-red-600/10 hover:border-red-600/50 transition-all shadow-lg shrink-0"
            title="Terminate Session">
            <LogOut size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>

        {/* Dynamic Tabs (Pill style) - Only for Super Admin */}
        {isSuper && (
          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/[0.06] shadow-inner w-full sm:w-fit overflow-x-auto no-scrollbar gap-1">
            <TabButton
              value="overview"
              icon={LayoutDashboard}
              label="Overview"
              activeTab={activeTab}
              onClick={setActiveTab}
            />
            <TabButton
              value="users"
              icon={Users}
              label="Access Control"
              activeTab={activeTab}
              onClick={setActiveTab}
            />
            <TabButton
              value="docs"
              icon={BookOpen}
              label="Architecture & Docs"
              activeTab={activeTab}
              onClick={setActiveTab}
            />
            <TabButton
              value="storage"
              icon={Database}
              label="Storage Manager"
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          </div>
        )}

        {/* --- CONTENT AREA --- */}

        {/* 1. OVERVIEW VIEW - Always visible for Dual Clearance operators, or when activeTab is overview */}
        {(!isSuper || activeTab === "overview") && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <Card
                title="ICMU Admin"
                description="Manage news, upcoming events, team roosters, and global site content."
                icon={Globe}
                linkTo={`${basePath}/dashboard`}
                btnTitle="Launch Admin"
              />
              <Card
                title="Broadcasting Admin"
                description="Live Broadcasting operations terminal, telemetry, and stream infrastructure."
                icon={ScanLine}
                linkTo={getBroadcasterAdminUrl(adminPath || user?.indexNumber, user)}
                btnTitle="Launch Protocol"
                disabled={false}
                external={true}
              />
            </div>
          </div>
        )}

        {/* 2. USER ACCESS MANAGEMENT - Super Admin Only */}
        {isSuper && activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Stats iOS style */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatBox
                label="Total Identities"
                value={totalUsers || "-"}
                icon={Users}
                color="text-white"
              />
              <StatBox
                label="Active Admins"
                value={activeAdmins || "-"}
                icon={ShieldCheck}
                color="text-cyan-400"
              />
              <StatBox
                label="Local Auth"
                value={localAuthCount || "-"}
                icon={Key}
                color="text-amber-400"
                className="col-span-2 lg:col-span-1"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-1 sm:p-2 mb-2">
              <div className="px-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Security Matrix
                </h3>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
                <div className="hidden sm:flex bg-zinc-900 p-1 rounded-2xl border border-white/[0.06] ">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-2xl transition-all ${
                      viewMode === "list"
                        ? "bg-white text-black shadow-sm"
                        : "text-zinc-500 hover:text-white"
                    }`}>
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2.5 rounded-2xl transition-all ${
                      viewMode === "card"
                        ? "bg-white text-black shadow-sm"
                        : "text-zinc-500 hover:text-white"
                    }`}>
                    <LayoutGrid size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      fetchUsers();
                      toast.success("Identity records refreshed");
                    }}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl border border-white/[0.06] transition-all cursor-pointer"
                    title="Refresh data">
                    <RefreshCw size={16} className={isLoadingUsers ? "animate-spin text-white" : ""} />
                  </button>
                  <button
                    onClick={() => setIsRoleGuideModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-2xl border border-white/[0.08] text-xs font-bold transition-all cursor-pointer shadow-sm"
                    title="View Role Guidelines & Clearance Matrix">
                    <BookOpen size={15} className="text-cyan-400" />
                    <span className="hidden sm:inline">Guidelines</span>
                  </button>
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer">
                    <Plus size={18} strokeWidth={2.5} /> New Identity
                  </button>
                </div>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="rounded-2xl border border-white/[0.06]  bg-zinc-950 min-h-[300px] flex flex-col items-center justify-center gap-4 shadow-xl">
                <Activity size={32} className="text-white animate-pulse" />
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                  Decrypting identities...
                </span>
              </div>
            ) : (
              <div className="w-full">
                {/* LIST VIEW (DESKTOP) */}
                <UserTableView
                  users={users}
                  viewMode={viewMode}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onEditUser={handleEditUserClick}
                  onResetPassword={handleResetPassword}
                  onToggleActive={handleToggleActive}
                  onDeleteUser={handleDeleteUser}
                  onRoleChange={handleRoleChange}
                />

                {/* CARD VIEW (MOBILE & DESKTOP) */}
                <UserCardGrid
                  users={users}
                  viewMode={viewMode}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onEditUser={handleEditUserClick}
                  onResetPassword={handleResetPassword}
                  onToggleActive={handleToggleActive}
                  onDeleteUser={handleDeleteUser}
                  onRoleChange={handleRoleChange}
                />
              </div>
            )}
          </div>
        )}

        {/* 3. STORAGE MANAGER - Super Admin Only */}
        {isSuper && activeTab === "storage" && <DatabaseStatus />}

        {/* 4. SYSTEM DOCUMENTATION - Super Admin Only */}
        {isSuper && activeTab === "docs" && <SystemDocumentation />}
      </div>

      {/* --- MODALS - Super Admin Only --- */}
      {isSuper && (
        <>
          <AddUserModal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            newUser={newUser}
            setNewUser={setNewUser}
            onSubmit={handleAddUser}
          />

          <EditUserModal
            isOpen={isEditUserModalOpen}
            onClose={() => setIsEditUserModalOpen(false)}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            onSubmit={handleUpdateUser}
          />

          <RoleGuidelinesModal
            isOpen={isRoleGuideModalOpen}
            onClose={() => setIsRoleGuideModalOpen(false)}
          />
        </>
      )}

    </div>
  );
};

export default MasterDashboard;
