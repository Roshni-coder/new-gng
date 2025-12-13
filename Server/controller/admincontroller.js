import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../model/adminModel.js';
import orderModel from '../model/order.js';
import sellermodel from '../model/sellermodel.js';
import addproductmodel from '../model/addproduct.js';
import usermodel from "../model/mongobd_usermodel.js";
import Review from '../model/review.js';
import ExcelJS from 'exceljs';
// Adjust path to your Order model
import PayoutModel from "../model/payout.js"; // Adjust path to your Payout model

// ... (Authentication functions remain the same) ...

export const registerAdmin = async (req, res) => {
  // ... existing code ...
    try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Registered successfully",
      token,
      name: newAdmin.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
   try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { name: admin.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... (User management remains the same) ...
export const userlist = async (req, res) => {
  try {
    const users = await usermodel.find().select('name email isBlocked createdAt');
    if (!users || users.length === 0) {
      return res.json({ success: false, message: "No users found" });
    }
    return res.json({ success: true, users });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const updatedUser = await usermodel.findByIdAndUpdate(
      userId,
      { isBlocked: !user.isBlocked },
      { new: true }
    ).select('name email isBlocked createdAt');

    return res.status(200).json({
      success: true,
      message: `User ${updatedUser.isBlocked ? "blocked" : "unblocked"} successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error toggling user block status:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const toggleApprove = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await sellermodel.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    const updatedSeller = await sellermodel.findByIdAndUpdate(
      sellerId,
      { approved: !seller.approved },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: `Seller ${updatedSeller.approved ? "approved" : "disapproved"} successfully.`,
      seller: updatedSeller,
    });
  } catch (error) {
    console.error("Error toggling seller approval:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ... (Product/Order management remain the same) ...
export const getAllProducts = async (req, res) => {
  try {
    const products = await addproductmodel.find({}).populate("sellerId", "name");
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found" });
    }
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const approveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await addproductmodel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const updatedProduct = await addproductmodel.findByIdAndUpdate(
      productId,
      { approved: !product.approved },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: `Product ${updatedProduct.approved ? "approved" : "disapproved"} successfully.`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error toggling product approval:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await addproductmodel.find({ sellerId });
    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching seller products:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("user", "name email")
      .populate("items.productId", "title price brand")
      .populate("items.sellerId", "name email nickName")
      .sort({ placedAt: -1 });
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments({});
    const totalProducts = await addproductmodel.countDocuments({});
    const totalSellers = await sellermodel.countDocuments({});
    const totalUsers = await usermodel.countDocuments({});
    const orders = await orderModel.find({ status: { $ne: "Cancelled" } });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const monthlyRevenue = await orderModel.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          placedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { $month: "$placedAt" },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    const activeSellers = await sellermodel.countDocuments({ approved: true });
    const pendingSellers = await sellermodel.countDocuments({ approved: false });
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalSellers,
        totalUsers,
        activeSellers,
        pendingSellers,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const recentOrders = await orderModel.find()
      .select('totalAmount placedAt _id')
      .sort({ placedAt: -1 })
      .limit(3)
      .lean();
    const newSellers = await sellermodel.find()
      .select('name createdAt')
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();
    let activities = [];
    recentOrders.forEach(order => {
      activities.push({
        id: order._id,
        text: `New Order #${order._id.toString().slice(-6).toUpperCase()} of ₹${order.totalAmount}`,
        time: order.placedAt,
        type: 'order'
      });
    });
    newSellers.forEach(seller => {
      activities.push({
        id: seller._id,
        text: `New Seller '${seller.name}' joined the platform`,
        time: seller.createdAt,
        type: 'user'
      });
    });
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json({ success: true, activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type === 'pending') {
      query.approved = false;
    } else if (type === 'featured') {
      query.isFeatured = true; 
    } else if (type === 'out-of-stock') {
      query.stock = { $lte: 0 };
    }
    const products = await addproductmodel.find(query)
      .populate('categoryname') 
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error in getAdminProducts:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const toggleFeatured = async (req, res) => {
    try {
        const product = await addproductmodel.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            await product.save();
            res.json({ success: true, message: "Featured status updated" });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { userName: { $regex: search, $options: "i" } },
          { comment: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } }
        ]
      };
    }
    const reviews = await Review.find(query)
      .populate({
        path: "productId",
        select: "title images sellerId",
        populate: {
          path: "sellerId",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalReviews = await Review.countDocuments(query);
    const allReviews = await Review.find({});
    const avgRating = allReviews.length > 0
      ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)
      : 0;
    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: { totalReviews, avgRating },
        pagination: { currentPage: Number(page), totalPages: Math.ceil(totalReviews / limit) }
      }
    });
  } catch (error) {
    console.error("Admin All Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.findByIdAndDelete(id);
        if (!deletedReview) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }
        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// --- FIX IS HERE IN getAllSellers ---
export const getAllSellers = async (req, res) => {
    try {
        const { search } = req.query;

        // 1. Construct Search Query
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },      
                { email: { $regex: search, $options: "i" } },     
                { nickName: { $regex: search, $options: "i" } }   
            ];

            // FIX: Only search 'phone' if the input is a number
            // Regex on Number type throws CastError in Mongoose
            if (!isNaN(search)) {
                 // Note: This matches strictly. E.g. search "98" matches phone 98 exactly. 
                 // It will NOT match 981234. To enable that, you MUST change Schema to String.
                 query.$or.push({ phone: Number(search) });
            }
        }

        // 2. Fetch filtered sellers
        const sellers = await sellermodel.find(query).select("-password").sort({ createdAt: -1 });
        
        // 3. Calculate stats
        const sellersWithStats = await Promise.all(sellers.map(async (seller) => {
            const products = await addproductmodel.countDocuments({ sellerId: seller._id });
            const salesData = await orderModel.aggregate([
                { $unwind: "$items" },
                { $match: { "items.sellerId": seller._id } },
                { $group: { _id: null, total: { $sum: "$items.price" }, count: { $sum: 1 } } }
            ]);

            return {
                ...seller.toObject(),
                totalProducts: products,
                totalSales: salesData[0]?.total || 0,
                totalOrders: salesData[0]?.count || 0
            };
        }));

        res.json({ success: true, sellers: sellersWithStats });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const toggleSellerApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = await sellermodel.findById(id);
        if (!seller) return res.json({ success: false, message: "Seller not found" });

        seller.approved = !seller.approved;
        await seller.save();

        res.json({ success: true, message: "Seller status updated", seller });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateSellerCommission = async (req, res) => {
    try {
        const { id } = req.params;
        const { commissionRate } = req.body;
        const seller = await sellermodel.findByIdAndUpdate(
            id, 
            { commissionRate: commissionRate }, 
            { new: true }
        );
        res.json({ success: true, message: "Commission updated", seller });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getSellerProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await addproductmodel.find({ sellerId: id });
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// 1. All Transactions (Master Ledger)
export const getAllTransactions = async (req, res) => {
  try {
    // Fetch Orders (Incoming Funds)
    const orders = await orderModel.find({})
      .select("totalAmount paymentMethod status placedAt _id")
      .sort({ placedAt: -1 });

    // Fetch Payouts (Outgoing Funds)
    const payouts = await PayoutModel.find({})
      .populate("sellerId", "name")
      .sort({ requestedAt: -1 });

    // Normalize Data
    const transactions = [
      ...orders.map(o => ({
        id: o._id,
        type: "Credit", // Money in
        entity: "Customer Order",
        amount: o.totalAmount,
        date: o.placedAt,
        status: o.status,
        method: o.paymentMethod
      })),
      ...payouts.map(p => ({
        id: p._id,
        type: "Debit", // Money out
        entity: `Payout to ${p.sellerId?.name || 'Vendor'}`,
        amount: p.amount,
        date: p.requestedAt,
        status: p.status,
        method: p.paymentMethod
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Vendor Payouts (Management)
export const getVendorPayouts = async (req, res) => {
  try {
    // Get pending payouts specifically
    const pending = await PayoutModel.find({ status: "Pending" })
      .populate("sellerId", "name email bankDetails");
    
    // Get history
    const history = await PayoutModel.find({ status: { $ne: "Pending" } })
      .populate("sellerId", "name")
      .limit(20);

    res.json({ success: true, pending, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Action: Approve/Reject Payout
export const processPayout = async (req, res) => {
  try {
    const { payoutId, status, transactionId } = req.body; // status: 'Completed' or 'Rejected'
    const payout = await PayoutModel.findByIdAndUpdate(
      payoutId, 
      { status, transactionId, processedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, message: `Payout ${status}`, payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Pending Settlements (Funds on Hold)
export const getPendingSettlements = async (req, res) => {
  try {
    // Logic: Orders Delivered but less than 7 days ago (Return period)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const settlements = await orderModel.find({
      status: "Delivered",
      updatedAt: { $gte: sevenDaysAgo } // Delivered recently, funds held
    }).populate("items.sellerId", "name");

    const totalHeld = settlements.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({ success: true, settlements, totalHeld });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Commission Reports
export const getCommissionReport = async (req, res) => {
  try {
    const commissionRate = 0.10; // 10% example

    const orders = await orderModel.find({ status: { $in: ["Delivered", "Completed"] } });
    
    let totalGMV = 0;
    let totalCommission = 0;

    orders.forEach(order => {
      totalGMV += order.totalAmount;
      totalCommission += (order.totalAmount * commissionRate);
    });

    res.json({ success: true, totalGMV, totalCommission, rate: "10%" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Refund Management
export const getRefunds = async (req, res) => {
  try {
    const refunds = await orderModel.find({ 
      status: { $in: ["Cancelled", "Returned", "Refunded"] } 
    }).sort({ updatedAt: -1 });

    res.json({ success: true, refunds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Financial Reports (Analytics)
export const getFinancialStats = async (req, res) => {
  try {
    const revenue = await orderModel.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const payouts = await PayoutModel.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue: revenue[0]?.total || 0,
        totalPayouts: payouts[0]?.total || 0,
        netProfit: (revenue[0]?.total || 0) * 0.10 // Assuming 10% profit margin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getInventoryData = async (req, res) => {
  try {
    const products = await addproductmodel.find({}).select("title stock price category");
    
    // Logic for Low Stock (e.g., less than 10)
    const lowStockItems = products.filter(p => p.stock < 10);
    
    // Calculate total inventory value
    const totalValue = products.reduce((acc, item) => acc + (item.price * item.stock), 0);

    res.json({
      success: true,
      totalProducts: products.length,
      lowStockCount: lowStockItems.length,
      totalValue,
      inventory: products,
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Update Stock
export const updateStock = async (req, res) => {
  try {
    const { productId, newStock } = req.body;
    await addproductmodel.findByIdAndUpdate(productId, { stock: newStock });
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- MARKETING CONTROLLERS ---

export const createCoupon = async (req, res) => {
  try {
    const { code, value, expiryDate, discountType } = req.body;
    const newCoupon = new Coupon({ code, value, expiryDate, discountType });
    await newCoupon.save();
    res.json({ success: true, message: "Coupon created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMarketingData = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    const banners = await Banner.find({});
    res.json({ success: true, coupons, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ANALYTICS CONTROLLER (Advanced) ---

export const getAdvancedAnalytics = async (req, res) => {
  try {
    // Aggregation for Revenue per Month
    const revenueData = await orderModel.aggregate([
      { $match: { status: { $ne: "Cancelled" } } }, // Exclude cancelled
      {
        $group: {
          _id: { $month: "$placedAt" },
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, revenueData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportSalesReport = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Define Columns
    worksheet.columns = [
      { header: 'Order ID', key: '_id', width: 25 },
      { header: 'Customer Name', key: 'name', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Payment Status', key: 'payment', width: 15 },
      { header: 'Order Status', key: 'status', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
    ];

    // Style Header Row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'FFE0E0E0'}
    };

    // Fetch Data
    const orders = await orderModel.find({}).sort({ placedAt: -1 });

    // Add Rows
    orders.forEach(order => {
      worksheet.addRow({
        _id: order._id.toString(),
        name: order.shippingAddress?.name || 'Guest',
        date: new Date(order.placedAt).toLocaleDateString(),
        payment: order.paymentId ? 'Online' : 'COD',
        status: order.status,
        amount: order.totalAmount
      });
    });

    // Total Row
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    worksheet.addRow({}); // Empty row
    worksheet.addRow({ status: 'Total Revenue:', amount: totalAmount }).font = { bold: true };

    // Set Response Headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'Sales_Report.xlsx'
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ success: false, message: "Could not generate report" });
  }
};