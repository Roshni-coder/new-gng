import React, { useContext, useState } from "react";
import { PiSignOutBold } from "react-icons/pi";
import { FaGift, FaChevronDown } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io"; // Added for modern dash feel
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Divider, IconButton, Badge } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Admincontext } from "../context/admincontext";

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { atoken, setatoken } = useContext(Admincontext);
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Admin";

  const handleClick = (event) => {
    if (atoken) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("atoken");
    localStorage.removeItem("name");
    setatoken("");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-[95px] flex items-center justify-between">
        
        {/* --- Left: Logo Section --- */}
        <Link to="/" className="flex pl-20 justify-center items-center gap-3 group text-decoration-none cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
            <FaGift className="text-[20px]" />
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight hidden sm:block">
            GiftNGifts
          </h1>
        </Link>

        {/* --- Right: Actions Section --- */}
        {atoken && (
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Notification Bell (Visual Only) */}
            <IconButton className="!text-gray-500 hover:!bg-gray-50 !hidden sm:!inline-flex">
              <Badge color="error" variant="dot">
                <IoMdNotificationsOutline size={24} />
              </Badge>
            </IconButton>

            <Divider orientation="vertical" flexItem className="!hidden sm:!block !mx-1 !h-6 !self-center" />

            {/* User Profile Trigger */}
            <div 
              onClick={handleClick}
              className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white">
                {name[0]?.toUpperCase()}
              </div>
              
              {/* Name & Role (Hidden on mobile) */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-700 leading-none">{name}</span>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-1">Administrator</span>
              </div>

              <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </div>
          </div>
        )}

        {/* --- Dropdown Menu --- */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          disableScrollLock={true}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 10px 40px rgba(0,0,0,0.08))",
                mt: 1.5,
                borderRadius: "16px",
                border: "1px solid #f3f4f6",
                minWidth: "220px",
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 24,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                  borderTop: "1px solid #f3f4f6",
                  borderLeft: "1px solid #f3f4f6",
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {/* Menu Header */}
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
            <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
          </div>

          <MenuItem onClick={handleClose} className="!py-2.5 !px-6 !text-gray-600 hover:!bg-indigo-50 hover:!text-indigo-600 !mx-2 !rounded-lg !transition-all">
            <span className="text-sm font-medium">Account Settings</span>
          </MenuItem>

          <Divider className="!my-2 !mx-4" />
          
          <MenuItem
            onClick={handleLogout}
            className="!py-2.5 !px-6 !text-red-500 hover:!bg-red-50 hover:!text-red-600 !mx-2 !rounded-lg !transition-all"
          >
            <PiSignOutBold className="mr-3 text-lg" />
            <span className="text-sm font-semibold">Sign Out</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

export default Header;