import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, Chip, LinearProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel } from "@mui/material";
import { MdPeople, MdExpandMore, MdDelete, MdCheck, MdClose } from "react-icons/md";
import { FiRefreshCw, FiPlus, FiShield } from "react-icons/fi";

function UserPermissions() {
    const { backendurl, atoken } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [roles, setRoles] = useState([]);
    const [newRole, setNewRole] = useState({
        roleName: "", description: "",
        permissions: {
            dashboard: { view: true, edit: false },
            products: { view: true, create: false, edit: false, delete: false },
            orders: { view: true, edit: false, cancel: false, refund: false },
            users: { view: false, create: false, edit: false, delete: false, block: false },
            vendors: { view: false, approve: false, edit: false, delete: false },
            categories: { view: true, create: false, edit: false, delete: false },
            reports: { view: false, export: false },
            settings: { view: false, edit: false },
            marketing: { view: false, create: false, edit: false },
            finance: { view: false, edit: false, process: false }
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendurl}/api/admin/settings/roles`, { headers: { token: atoken } });
            if (data.success) setRoles(data.roles || []);
        } catch (e) {
            console.error("Error fetching roles:", e);
        } finally {
            setLoading(false);
        }
    };

    const createRole = async () => {
        if (!newRole.roleName) return;
        try {
            const { data } = await axios.post(`${backendurl}/api/admin/settings/role`, newRole, { headers: { token: atoken } });
            if (data.success) {
                fetchData();
                setOpenDialog(false);
                resetNewRole();
                setSuccess("Role created successfully!");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (e) {
            alert("Failed to create role");
        }
    };

    const deleteRole = async (id) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        try {
            await axios.delete(`${backendurl}/api/admin/settings/role/${id}`, { headers: { token: atoken } });
            fetchData();
            setSuccess("Role deleted!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (e) {
            alert(e.response?.data?.message || "Failed to delete role");
        }
    };

    const resetNewRole = () => {
        setNewRole({
            roleName: "", description: "",
            permissions: {
                dashboard: { view: true, edit: false },
                products: { view: true, create: false, edit: false, delete: false },
                orders: { view: true, edit: false, cancel: false, refund: false },
                users: { view: false, create: false, edit: false, delete: false, block: false },
                vendors: { view: false, approve: false, edit: false, delete: false },
                categories: { view: true, create: false, edit: false, delete: false },
                reports: { view: false, export: false },
                settings: { view: false, edit: false },
                marketing: { view: false, create: false, edit: false },
                finance: { view: false, edit: false, process: false }
            }
        });
    };

    const updatePermission = (module, permission, value) => {
        setNewRole({
            ...newRole,
            permissions: {
                ...newRole.permissions,
                [module]: {
                    ...newRole.permissions[module],
                    [permission]: value
                }
            }
        });
    };

    const getRoleColor = (roleName) => {
        const colors = {
            'Super Admin': '#ef4444',
            'Admin': '#3b82f6',
            'Support': '#10b981',
            'Marketing': '#f59e0b'
        };
        return colors[roleName] || '#6b7280';
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MdPeople size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">User Permissions</h2>
                        <p className="text-sm text-gray-500">Manage roles and permissions for admin users.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpenDialog(true)}>Create Role</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Roles List */}
            <div className="space-y-4">
                {roles.map(role => (
                    <Accordion key={role._id} className="border rounded-xl overflow-hidden">
                        <AccordionSummary expandIcon={<MdExpandMore />} className="bg-gray-50">
                            <div className="flex items-center gap-4 w-full pr-4">
                                <Avatar sx={{ bgcolor: getRoleColor(role.roleName), width: 40, height: 40 }}>
                                    <FiShield size={20} />
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{role.roleName}</h3>
                                        {role.isSystemRole && <Chip size="small" label="System Role" color="primary" />}
                                    </div>
                                    <p className="text-sm text-gray-500">{role.description || "No description"}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {role.users?.length || 0} users
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails className="bg-white">
                            <h4 className="font-bold mb-4">Permissions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {Object.entries(role.permissions || {}).map(([module, perms]) => (
                                    <Card key={module} variant="outlined" className="p-3">
                                        <h5 className="font-medium capitalize text-sm mb-2">{module}</h5>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(perms || {}).map(([perm, allowed]) => (
                                                <span key={perm} className={`text-xs px-2 py-0.5 rounded ${allowed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {allowed ? <MdCheck className="inline mr-1" size={12} /> : <MdClose className="inline mr-1" size={12} />}
                                                    {perm}
                                                </span>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                            {!role.isSystemRole && (
                                <Button color="error" startIcon={<MdDelete />} sx={{ mt: 3 }} onClick={() => deleteRole(role._id)}>
                                    Delete Role
                                </Button>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}

                {roles.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <MdPeople size={48} className="mx-auto text-gray-300 mb-3" />
                        <p>No roles configured</p>
                    </div>
                )}
            </div>

            {/* Create Role Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogContent>
                    <div className="space-y-4 pt-4">
                        <TextField fullWidth label="Role Name" placeholder="e.g., Content Manager" value={newRole.roleName} onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })} />
                        <TextField fullWidth label="Description" multiline rows={2} value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />

                        <h4 className="font-bold mt-4">Permissions</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                            {Object.entries(newRole.permissions).map(([module, perms]) => (
                                <Card key={module} variant="outlined" className="p-3">
                                    <h5 className="font-medium capitalize mb-2">{module}</h5>
                                    <div className="space-y-1">
                                        {Object.entries(perms).map(([perm, allowed]) => (
                                            <FormControlLabel
                                                key={perm}
                                                control={<Switch size="small" checked={allowed} onChange={(e) => updatePermission(module, perm, e.target.checked)} />}
                                                label={<span className="text-sm capitalize">{perm}</span>}
                                            />
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDialog(false); resetNewRole(); }}>Cancel</Button>
                    <Button variant="contained" onClick={createRole}>Create Role</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default UserPermissions;
