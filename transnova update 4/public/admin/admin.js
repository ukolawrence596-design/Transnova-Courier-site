// admin.js - COMPLETE UPDATED VERSION WITH INVOICE

// ===================================
// CHECK AUTHENTICATION
// ===================================
function checkAuth() {
    FirebaseAuth.onAuthStateChanged((user) => {
        const currentPage = window.location.pathname;

        if (user) {
            if (currentPage.includes("login.html")) {
                window.location.href = "dashboard.html";
            } else {
                const emailDisplay = document.getElementById("adminEmail");
                if (emailDisplay) {
                    emailDisplay.textContent = user.email;
                }
                if (currentPage.includes("dashboard.html")) {
                    loadDashboardData();
                }
            }
        } else {
            if (!currentPage.includes("login.html")) {
                window.location.href = "login.html";
            }
        }
    });
}

checkAuth();

// ===================================
// LOGOUT FUNCTIONALITY
// ===================================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to logout?")) {
            await FirebaseAuth.signOut();
            window.location.href = "login.html";
        }
    });
}

// ===================================
// NAVIGATION
// ===================================
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();

        const view = item.getAttribute("data-view");

        navItems.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");

        document.querySelectorAll(".view-section").forEach((section) => {
            section.classList.remove("active");
        });
        document.getElementById(view + "View").classList.add("active");

        const titles = {
            overview: "Dashboard Overview",
            create: "Create Tracking Code",
            list: "All Parcels",
            update: "Update Status",
            invoice: "Invoice Management",
        };
        document.getElementById("pageTitle").textContent = titles[view];

        if (view === "list") {
            loadAllParcels();
        } else if (view === "overview") {
            loadDashboardData();
        }
    });
});

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
}

// ===================================
// GENERATE TRACKING CODE
// ===================================
function generateNewCode() {
    const trackingCode = generateTrackingCode();
    document.getElementById("trackingCode").value = trackingCode;
}

window.addEventListener("load", () => {
    if (document.getElementById("trackingCode")) {
        generateNewCode();
    }
});

// ===================================
// CREATE TRACKING CODE
// ===================================
const createTrackingForm = document.getElementById("createTrackingForm");
if (createTrackingForm) {
    createTrackingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const trackingCode = document.getElementById("trackingCode").value;

        // Get shipping history entry
        const historyEntry = {
            trackingCode: trackingCode,
            location: document.getElementById("location").value,
            status: document.getElementById("status").value,
            arrivalDate: document.getElementById("arrivalDate").value,
            deliveryDate: document.getElementById("deliveryDate").value,
            remark: document.getElementById("remark").value || "Parcel created",
            locationMap: document.getElementById("locationMap").value || "",
            timestamp: Date.now(),
        };

        const parcelData = {
            sender: {
                name: document.getElementById("senderName").value,
                email: document.getElementById("senderEmail").value,
                phone: document.getElementById("senderPhone").value,
                address: document.getElementById("senderAddress").value,
            },
            receiver: {
                name: document.getElementById("receiverName").value,
                email: document.getElementById("receiverEmail").value,
                phone: document.getElementById("receiverPhone").value,
                address: document.getElementById("receiverAddress").value,
                destinationOffice: "Angola", // Default destination
            },
            shippingCompany: document.getElementById("shippingCompany").value,
            shippingCountry: document.getElementById("shippingCountry").value,
            status: document.getElementById("status").value,
            location: document.getElementById("location").value,
            estimatedDelivery:
                document.getElementById("estimatedDelivery").value,
            weight: document.getElementById("weight").value,
            shippingService: document.getElementById("shippingService").value,
            packageType: document.getElementById("packageType").value,
            departureDate:
                document.getElementById("departureDate").value ||
                new Date().toISOString().split("T")[0],
            packageDescription:
                document.getElementById("packageDescription").value,
            shippingHistory: [historyEntry], // Array with first entry
            // Invoice data
            invoice: {
                orderId: Math.floor(Math.random() * 9000) + 1000,
                bookingMode: "Paid",
                qty: 1,
                insurance: 5000,
                vat: 120,
                cif: -3087.2,
                subtotal: 2032.8,
            },
        };

        console.log("Creating parcel with data:", parcelData);

        const result = await FirebaseDB.createParcel(trackingCode, parcelData);

        if (result.success) {
            alert(
                "✅ Tracking code created successfully!\n\nTracking Code: " +
                    trackingCode,
            );
            createTrackingForm.reset();
            generateNewCode();
            loadDashboardData();
        } else {
            alert("❌ Error: " + result.message);
        }
    });
}

// ===================================
// LOAD ALL PARCELS
// ===================================
async function loadAllParcels() {
    const tbody = document.getElementById("parcelsTableBody");
    if (!tbody) return;

    tbody.innerHTML =
        '<tr><td colspan="7" style="text-align: center;">Loading...</td></tr>';

    const result = await FirebaseDB.getAllParcels();

    if (result.success && result.data.length > 0) {
        tbody.innerHTML = "";
        result.data.forEach((parcel) => {
            const row = createParcelRow(parcel);
            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML =
            '<tr><td colspan="7" style="text-align: center;">No parcels found</td></tr>';
    }
}

function createParcelRow(parcel) {
    const tr = document.createElement("tr");

    const statusClass =
        "status-" + parcel.status.replace(" ", "-").toLowerCase();

    tr.innerHTML = `
        <td><strong>${parcel.trackingCode}</strong></td>
        <td>${parcel.sender.name}</td>
        <td>${parcel.receiver.name}</td>
        <td><span class="status-badge ${statusClass}">${parcel.status}</span></td>
        <td>${parcel.location}</td>
        <td>${parcel.estimatedDelivery}</td>
        <td class="action-buttons">
            <button class="btn-edit" onclick="editParcel('${parcel.trackingCode}')">Edit</button>
            <button class="btn-delete" onclick="deleteParcel('${parcel.trackingCode}')">Delete</button>
        </td>
    `;

    return tr;
}

// ===================================
// EDIT PARCEL
// ===================================
function editParcel(trackingCode) {
    document.querySelector('[data-view="update"]').click();
    document.getElementById("updateTrackingCode").value = trackingCode;
    searchParcelForUpdate();
}

// ===================================
// DELETE PARCEL
// ===================================
async function deleteParcel(trackingCode) {
    if (confirm(`Are you sure you want to delete parcel ${trackingCode}?`)) {
        const result = await FirebaseDB.deleteParcel(trackingCode);

        if (result.success) {
            alert("✅ Parcel deleted successfully!");
            loadAllParcels();
            loadDashboardData();
        } else {
            alert("❌ Error: " + result.message);
        }
    }
}

// ===================================
// SEARCH PARCEL FOR UPDATE
// ===================================
async function searchParcelForUpdate() {
    const trackingCode = document
        .getElementById("updateTrackingCode")
        .value.trim();
    const formContent = document.getElementById("updateFormContent");

    if (!trackingCode) {
        alert("Please enter a tracking code");
        return;
    }

    const result = await FirebaseDB.getParcel(trackingCode);

    if (result.success) {
        const data = result.data;
        formContent.style.display = "block";

        // Populate form fields
        document.getElementById("updateStatus").value = data.status;
        document.getElementById("updateLocation").value = data.location;

        // Populate arrival and delivery dates
        document.getElementById("updateArrivalDate").value =
            data.arrivalDate || "";
        document.getElementById("updateDeliveryDate").value =
            data.deliveryDate || "";
        document.getElementById("updateLocationMap").value =
            data.locationMap || "";
    } else {
        alert("❌ Tracking code not found");
        formContent.style.display = "none";
    }
}

// ===================================
// UPDATE PARCEL STATUS
// ===================================
const updateStatusForm = document.getElementById("updateStatusForm");
if (updateStatusForm) {
    updateStatusForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const trackingCode = document
            .getElementById("updateTrackingCode")
            .value.trim();
        const newStatus = document.getElementById("updateStatus").value;
        const newLocation = document.getElementById("updateLocation").value;
        const message = document.getElementById("updateMessage").value;
        const arrivalDate = document.getElementById("updateArrivalDate").value;
        const deliveryDate =
            document.getElementById("updateDeliveryDate").value;
        const locationMap = document.getElementById("updateLocationMap").value;

        // Update main parcel data
        const updateData = {
            status: newStatus,
            location: newLocation,
        };

        if (arrivalDate) updateData.arrivalDate = arrivalDate;
        if (deliveryDate) updateData.deliveryDate = deliveryDate;
        if (locationMap) updateData.locationMap = locationMap;

        const updateResult = await FirebaseDB.updateParcel(
            trackingCode,
            updateData,
        );

        // Add new entry to shipping history
        const historyEntry = {
            trackingCode: trackingCode,
            status: newStatus,
            location: newLocation,
            arrivalDate: arrivalDate,
            deliveryDate: deliveryDate,
            remark: message || "Status updated",
            locationMap: locationMap,
            timestamp: Date.now(),
        };

        const historyResult = await FirebaseDB.addShippingHistoryEntry(
            trackingCode,
            historyEntry,
        );

        if (updateResult.success && historyResult.success) {
            alert("✅ Status updated successfully!");
            updateStatusForm.reset();
            document.getElementById("updateFormContent").style.display = "none";
            loadDashboardData();
        } else {
            alert("❌ Error updating status");
        }
    });
}

// ===================================
// SEARCH PARCELS (FILTER)
// ===================================
const searchInput = document.getElementById("searchParcels");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll("#parcelsTableBody tr");

        rows.forEach((row) => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? "" : "none";
        });
    });
}

// ===================================
// LOAD DASHBOARD DATA
// ===================================
async function loadDashboardData() {
    const result = await FirebaseDB.getAllParcels();

    if (result.success) {
        const parcels = result.data;

        document.getElementById("totalParcels").textContent = parcels.length;
        document.getElementById("inTransit").textContent = parcels.filter(
            (p) => p.status === "in-transit",
        ).length;
        document.getElementById("delivered").textContent = parcels.filter(
            (p) => p.status === "delivered",
        ).length;
        document.getElementById("pending").textContent = parcels.filter(
            (p) => p.status === "pending",
        ).length;

        loadRecentActivity(parcels);
    }
}

function loadRecentActivity(parcels) {
    const activityList = document.getElementById("recentActivity");
    if (!activityList) return;

    const recentParcels = parcels
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, 5);

    if (recentParcels.length === 0) {
        activityList.innerHTML =
            '<p style="text-align: center; color: var(--text-secondary);">No recent activity</p>';
        return;
    }

    activityList.innerHTML = "";
    recentParcels.forEach((parcel) => {
        const item = document.createElement("div");
        item.className = "activity-item";
        item.innerHTML = `
            <div class="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="activity-info">
                <h4>${parcel.trackingCode} - ${parcel.status}</h4>
                <p>${parcel.location} • ${new Date(parcel.updatedAt).toLocaleString()}</p>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// ===================================
// INVOICE FUNCTIONALITY
// ===================================
let currentInvoiceData = null;
let isEditMode = false;

async function loadInvoiceData() {
    const trackingCode = document
        .getElementById("invoiceTrackingCode")
        .value.trim();

    if (!trackingCode) {
        alert("Please enter a tracking code");
        return;
    }

    const result = await FirebaseDB.getParcel(trackingCode);

    if (result.success) {
        currentInvoiceData = {
            trackingCode: trackingCode,
            ...result.data,
        };

        // Add invoice-specific fields if they don't exist
        if (!currentInvoiceData.invoice) {
            currentInvoiceData.invoice = {
                orderId: Math.floor(Math.random() * 9000) + 1000,
                bookingMode: "Paid",
                qty: 1,
                insurance: 5000,
                vat: 120,
                cif: -3087.2,
                subtotal: 2032.8,
            };
        }

        document.getElementById("invoiceContent").style.display = "block";
        renderInvoice();
    } else {
        alert("❌ Tracking code not found");
        document.getElementById("invoiceContent").style.display = "none";
    }
}

function renderInvoice() {
    const invoicePreview = document.getElementById("invoicePreview");
    const data = currentInvoiceData;
    const invoice = data.invoice;

    const dateCreated = new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    invoicePreview.innerHTML = `
        <div class="invoice-container ${isEditMode ? "edit-mode" : ""}">
            <div class="invoice-header">
                <div class="invoice-logo">
                    <img src="../images/logo.png" alt="TransNova Logo" />
                    <h1>TransNova Courier</h1>
                </div>
                <div class="invoice-title">
                    <h2>INVOICE</h2>
                    <p class="invoice-date">${dateCreated}</p>
                </div>
            </div>

            <div class="invoice-parties">
                <div class="invoice-party">
                    <h3>FROM</h3>
                    <div class="party-details ${isEditMode ? "editable" : ""}">
                        ${renderField("senderName", data.sender.name, "Name")}
                        ${renderField("senderPhone", data.sender.phone, "Phone")}
                        ${renderField("senderAddress", data.sender.address, "Address")}
                        ${renderField("shippingCountry", data.shippingCountry || "Turkey", "Origin Office")}
                    </div>
                </div>
                <div class="invoice-party">
                    <h3>TO</h3>
                    <div class="party-details ${isEditMode ? "editable" : ""}">
                        ${renderField("receiverName", data.receiver.name, "Name")}
                        ${renderField("receiverPhone", data.receiver.phone, "Phone")}
                        ${renderField("receiverAddress", data.receiver.address, "Address")}
                        ${renderField("destinationOffice", data.receiver.destinationOffice || "Angola", "Destination Office")}
                    </div>
                </div>
            </div>

            <div class="invoice-tracking">
                <div class="barcode-section">
                    <svg class="barcode" viewBox="0 0 200 80">
                        <rect x="5" y="10" width="3" height="60" fill="#000"/>
                        <rect x="12" y="10" width="2" height="60" fill="#000"/>
                        <rect x="18" y="10" width="4" height="60" fill="#000"/>
                        <rect x="26" y="10" width="2" height="60" fill="#000"/>
                        <rect x="32" y="10" width="3" height="60" fill="#000"/>
                        <rect x="40" y="10" width="2" height="60" fill="#000"/>
                        <rect x="46" y="10" width="4" height="60" fill="#000"/>
                        <rect x="54" y="10" width="3" height="60" fill="#000"/>
                        <rect x="62" y="10" width="2" height="60" fill="#000"/>
                        <rect x="68" y="10" width="4" height="60" fill="#000"/>
                        <rect x="76" y="10" width="2" height="60" fill="#000"/>
                        <rect x="82" y="10" width="3" height="60" fill="#000"/>
                        <rect x="90" y="10" width="4" height="60" fill="#000"/>
                        <rect x="98" y="10" width="2" height="60" fill="#000"/>
                        <rect x="104" y="10" width="3" height="60" fill="#000"/>
                        <rect x="112" y="10" width="2" height="60" fill="#000"/>
                        <rect x="118" y="10" width="4" height="60" fill="#000"/>
                        <rect x="126" y="10" width="3" height="60" fill="#000"/>
                        <rect x="134" y="10" width="2" height="60" fill="#000"/>
                        <rect x="140" y="10" width="4" height="60" fill="#000"/>
                        <rect x="148" y="10" width="2" height="60" fill="#000"/>
                        <rect x="154" y="10" width="3" height="60" fill="#000"/>
                        <rect x="162" y="10" width="4" height="60" fill="#000"/>
                        <rect x="170" y="10" width="2" height="60" fill="#000"/>
                        <rect x="176" y="10" width="3" height="60" fill="#000"/>
                        <rect x="184" y="10" width="4" height="60" fill="#000"/>
                        <rect x="192" y="10" width="3" height="60" fill="#000"/>
                    </svg>
                    <p class="tracking-number">${data.trackingCode}</p>
                </div>
            </div>

            <div class="invoice-details">
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    ${renderField("orderId", invoice.orderId, "", "number")}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Book Date:</span>
                    ${renderField("bookDate", data.departureDate || new Date().toISOString().split("T")[0], "", "date")}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Mode:</span>
                    ${renderSelectField("bookingMode", invoice.bookingMode, ["Paid", "Pending", "COD"])}
                </div>
            </div>

            <div class="invoice-table">
                <table>
                    <thead>
                        <tr>
                            <th>Qty</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Description</th>
                            <th>Service</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${renderField("qty", invoice.qty, "", "number")}</td>
                            <td>${renderField("packageType", data.packageType || "Package")}</td>
                            <td><span class="status-badge status-${data.status}">${data.status}</span></td>
                            <td>${renderField("packageDescription", data.packageDescription || "Freight shipment")}</td>
                            <td>${renderField("shippingService", data.shippingService || "Freight")}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="payment-methods">
                <h3>Payment Methods:</h3>
                <p>For your convenience, our several payment options are reliable, fast and secure.</p>
                <div class="payment-icons">
                    <div class="payment-icon">
                        <svg viewBox="0 0 48 32" width="60" height="40">
                            <rect width="48" height="32" rx="4" fill="#1434CB"/>
                            <circle cx="18" cy="16" r="8" fill="#EB001B"/>
                            <circle cx="30" cy="16" r="8" fill="#F79E1B"/>
                        </svg>
                        <span>Mastercard</span>
                    </div>
                    <div class="payment-icon">
                        <svg viewBox="0 0 48 32" width="60" height="40">
                            <rect width="48" height="32" rx="4" fill="#0066B2"/>
                            <path d="M20 12h8v8h-8z" fill="#FCD116"/>
                            <path d="M16 16l4-4v8l-4-4z" fill="#FCD116"/>
                        </svg>
                        <span>Visa</span>
                    </div>
                    <div class="payment-icon">
                        <svg viewBox="0 0 48 32" width="60" height="40">
                            <rect width="48" height="32" rx="4" fill="#00579F"/>
                            <circle cx="18" cy="16" r="6" fill="none" stroke="#FFF" stroke-width="2"/>
                            <circle cx="30" cy="16" r="6" fill="none" stroke="#FFF" stroke-width="2"/>
                        </svg>
                        <span>PayPal</span>
                    </div>
                </div>
            </div>

            <div class="shipping-fees">
                <h3>Shipping Fees</h3>
                <div class="fee-row">
                    <span>INSURANCE:</span>
                    <span>$ ${renderField("insurance", invoice.insurance, "", "number")}</span>
                </div>
                <div class="fee-row">
                    <span>VAT:</span>
                    <span>$ ${renderField("vat", invoice.vat, "", "number")}</span>
                </div>
                <div class="fee-row">
                    <span>CIF:</span>
                    <span>$ ${renderField("cif", invoice.cif, "", "number")}</span>
                </div>
                <div class="fee-row total">
                    <span>Subtotal:</span>
                    <span>$ ${renderField("subtotal", invoice.subtotal, "", "number")}</span>
                </div>
            </div>
        </div>
    `;
}

function renderField(fieldName, value, label = "", type = "text") {
    if (isEditMode) {
        return `<input type="${type}" class="invoice-edit-field" data-field="${fieldName}" value="${value || ""}" />`;
    }
    return `<span class="invoice-value">${label ? label + ": " : ""}${value || ""}</span>`;
}

function renderSelectField(fieldName, value, options) {
    if (isEditMode) {
        const optionsHTML = options
            .map(
                (opt) =>
                    `<option value="${opt}" ${opt === value ? "selected" : ""}>${opt}</option>`,
            )
            .join("");
        return `<select class="invoice-edit-field" data-field="${fieldName}">${optionsHTML}</select>`;
    }
    return `<span class="invoice-value">${value}</span>`;
}

function toggleEditMode() {
    isEditMode = !isEditMode;

    if (!isEditMode) {
        // Save changes
        saveInvoiceChanges();
    }

    const btn = document.querySelector(".btn-edit-invoice");
    btn.innerHTML = isEditMode
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Save Changes'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit Invoice';

    renderInvoice();
}

async function saveInvoiceChanges() {
    const fields = document.querySelectorAll(".invoice-edit-field");

    fields.forEach((field) => {
        const fieldName = field.getAttribute("data-field");
        const value = field.value;

        // Update the data structure
        if (fieldName.startsWith("sender")) {
            const key = fieldName.replace("sender", "").toLowerCase();
            if (key === "name") currentInvoiceData.sender.name = value;
            else if (key === "phone") currentInvoiceData.sender.phone = value;
            else if (key === "address")
                currentInvoiceData.sender.address = value;
        } else if (fieldName.startsWith("receiver")) {
            const key = fieldName.replace("receiver", "").toLowerCase();
            if (key === "name") currentInvoiceData.receiver.name = value;
            else if (key === "phone") currentInvoiceData.receiver.phone = value;
            else if (key === "address")
                currentInvoiceData.receiver.address = value;
        } else if (
            [
                "orderId",
                "bookingMode",
                "qty",
                "insurance",
                "vat",
                "cif",
                "subtotal",
            ].includes(fieldName)
        ) {
            currentInvoiceData.invoice[fieldName] =
                fieldName === "bookingMode"
                    ? value
                    : parseFloat(value) || value;
        } else {
            currentInvoiceData[fieldName] = value;
        }
    });

    // Save to Firebase
    const result = await FirebaseDB.updateParcel(
        currentInvoiceData.trackingCode,
        currentInvoiceData,
    );

    if (result.success) {
        alert("✅ Invoice updated successfully!");
    } else {
        alert("❌ Error updating invoice");
    }
}

function printInvoice() {
    const printWindow = window.open("", "_blank");
    const invoiceHTML = document.querySelector(".invoice-container").outerHTML;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${currentInvoiceData.trackingCode}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <style>
                ${getInvoicePrintStyles()}
            </style>
        </head>
        <body>
            ${invoiceHTML}
        </body>
        </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function saveAsPDF() {
    // Use browser's print to PDF feature
    printInvoice();
    setTimeout(() => {
        alert(
            '💡 Use your browser\'s "Save as PDF" option in the print dialog to save the invoice.',
        );
    }, 100);
}

function getInvoicePrintStyles() {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; padding: 40px; background: white; color: #000; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
        .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
        .invoice-logo { display: flex; align-items: center; gap: 15px; }
        .invoice-logo img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
        .invoice-logo h1 { font-size: 28px; color: #667eea; }
        .invoice-title h2 { font-size: 36px; color: #667eea; text-align: right; }
        .invoice-date { color: #666; font-size: 14px; margin-top: 5px; }
        .invoice-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .invoice-party h3 { font-size: 16px; color: #667eea; margin-bottom: 15px; font-weight: 700; }
        .party-details { font-size: 14px; line-height: 1.8; }
        .invoice-value { display: block; color: #333; }
        .invoice-tracking { text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .barcode { width: 200px; height: 80px; margin: 0 auto; display: block; }
        .tracking-number { font-size: 20px; font-weight: 700; color: #667eea; margin-top: 10px; letter-spacing: 2px; }
        .invoice-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .detail-row { font-size: 14px; }
        .detail-label { font-weight: 600; color: #667eea; display: block; margin-bottom: 5px; }
        .invoice-table { margin: 30px 0; }
        .invoice-table table { width: 100%; border-collapse: collapse; }
        .invoice-table th { background: #667eea; color: white; padding: 12px; text-align: left; font-weight: 600; }
        .invoice-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .status-badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #00f2fe; color: white; }
        .payment-methods { margin: 30px 0; }
        .payment-methods h3 { font-size: 18px; color: #667eea; margin-bottom: 10px; }
        .payment-methods p { color: #666; font-size: 14px; margin-bottom: 20px; }
        .payment-icons { display: flex; gap: 30px; justify-content: center; }
        .payment-icon { text-align: center; }
        .payment-icon span { display: block; margin-top: 8px; font-size: 12px; color: #666; }
        .shipping-fees { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; }
        .shipping-fees h3 { font-size: 18px; color: #667eea; margin-bottom: 15px; }
        .fee-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .fee-row.total { border-top: 2px solid #667eea; border-bottom: none; font-weight: 700; font-size: 16px; color: #667eea; margin-top: 10px; padding-top: 15px; }
        @media print { body { padding: 0; } }
    `;
}

console.log("✅ Admin panel loaded successfully");
