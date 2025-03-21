// utils/permissions.js
const PERMISSIONS = {
    // Profile-related permissions
    EDIT_PROFILE: 'Edit Profile',
    MANAGE_PROFILE: 'Manage Profile',
    DELETE_PROFILE: 'Delete Profile',
    CHANGE_PASSWORD: 'Change Password',

    // User-related permissions
    MANAGE_USER: 'Manage User',
    CREATE_USER: 'Create User',
    EDIT_USER: 'Edit User',
    DELETE_USER: 'Delete User',

    // Permission-related permissions
    CREATE_PERMISSION: 'Create Permission',
    MANAGE_PERMISSION: 'Manage Permission',
    DELETE_PERMISSION: 'Delete Permission',
    EDIT_PERMISSION: 'Edit Permission',

    // Role-related permissions
    CREATE_ROLE: 'Create Role',
    MANAGE_ROLE: 'Manage Role',
    EDIT_ROLE: 'Edit Role',
    DELETE_ROLE: 'Delete Role',

    // System settings
    SYSTEM_SETTINGS: 'System Settings',
    EMAIL_SETTINGS: 'Email Settings',
    BILLING_SETTINGS: 'Billing Settings',
    STORE_SETTINGS: 'Store Settings',

    // Language-related permissions
    MANAGE_LANGUAGE: 'Manage Language',
    CREATE_LANGUAGE: 'Create Language',
    CHANGE_LANGUAGE: 'Change Language',

    // Logo-related permissions
    MANAGE_LOGOS: 'Manage Logos',

    // Branch-related permissions
    MANAGE_BRANCH: 'Manage Branch',
    CREATE_BRANCH: 'Create Branch',
    EDIT_BRANCH: 'Edit Branch',
    DELETE_BRANCH: 'Delete Branch',

    // Tax-related permissions
    MANAGE_TAX: 'Manage Tax',
    CREATE_TAX: 'Create Tax',
    EDIT_TAX: 'Edit Tax',
    DELETE_TAX: 'Delete Tax',

    // Unit-related permissions
    MANAGE_UNIT: 'Manage Unit',
    CREATE_UNIT: 'Create Unit',
    EDIT_UNIT: 'Edit Unit',
    DELETE_UNIT: 'Delete Unit',

    // Product-related permissions
    MANAGE_PRODUCT: 'Manage Product',
    CREATE_PRODUCT: 'Create Product',
    EDIT_PRODUCT: 'Edit Product',
    DELETE_PRODUCT: 'Delete Product',

    // Category-related permissions
    MANAGE_CATEGORY: 'Manage Category',
    CREATE_CATEGORY: 'Create Category',
    EDIT_CATEGORY: 'Edit Category',
    DELETE_CATEGORY: 'Delete Category',

    // Brand-related permissions
    MANAGE_BRAND: 'Manage Brand',
    CREATE_BRAND: 'Create Brand',
    EDIT_BRAND: 'Edit Brand',
    DELETE_BRAND: 'Delete Brand',

    // Cash Register-related permissions
    MANAGE_CASH_REGISTER: 'Manage Cash Register',
    CREATE_CASH_REGISTER: 'Create Cash Register',
    EDIT_CASH_REGISTER: 'Edit Cash Register',
    DELETE_CASH_REGISTER: 'Delete Cash Register',

    // Purchase and Sales
    MANAGE_PURCHASES: 'Manage Purchases',
    MANAGE_SALES: 'Manage Sales',

    // Customer-related permissions
    MANAGE_CUSTOMER: 'Manage Customer',
    CREATE_CUSTOMER: 'Create Customer',
    EDIT_CUSTOMER: 'Edit Customer',
    DELETE_CUSTOMER: 'Delete Customer',

    // Vendor-related permissions
    MANAGE_VENDOR: 'Manage Vendor',
    CREATE_VENDOR: 'Create Vendor',
    EDIT_VENDOR: 'Edit Vendor',
    DELETE_VENDOR: 'Delete Vendor',

    // Returns-related permissions
    MANAGE_RETURNS: 'Manage Returns',
    CREATE_RETURNS: 'Create Returns',
    EDIT_RETURNS: 'Edit Returns',
    DELETE_RETURNS: 'Delete Returns',

    // Quotations-related permissions
    CREATE_QUOTATIONS: 'Create Quotations',
    MANAGE_QUOTATIONS: 'Manage Quotations',
    EDIT_QUOTATIONS: 'Edit Quotations',
    DELETE_QUOTATIONS: 'Delete Quotations',

    // Expense Category-related permissions
    MANAGE_EXPENSE_CATEGORY: 'Manage Expense Category',
    CREATE_EXPENSE_CATEGORY: 'Create Expense Category',
    EDIT_EXPENSE_CATEGORY: 'Edit Expense Category',
    DELETE_EXPENSE_CATEGORY: 'Delete Expense Category',

    // Expense-related permissions
    MANAGE_EXPENSE: 'Manage Expense',
    CREATE_EXPENSE: 'Create Expense',
    EDIT_EXPENSE: 'Edit Expense',
    DELETE_EXPENSE: 'Delete Expense',

    // Branch Sales Target-related permissions
    MANAGE_BRANCH_SALES_TARGET: 'Manage Branch Sales Target',
    CREATE_BRANCH_SALES_TARGET: 'Create Branch Sales Target',
    EDIT_BRANCH_SALES_TARGET: 'Edit Branch Sales Target',
    DELETE_BRANCH_SALES_TARGET: 'Delete Branch Sales Target',

    // Calendar Event-related permissions
    MANAGE_CALENDAR_EVENT: 'Manage Calendar Event',
    CREATE_CALENDAR_EVENT: 'Create Calendar Event',
    EDIT_CALENDAR_EVENT: 'Edit Calendar Event',
    DELETE_CALENDAR_EVENT: 'Delete Calendar Event',

    // Notification-related permissions
    MANAGE_NOTIFICATION: 'Manage Notification',
    CREATE_NOTIFICATION: 'Create Notification',
    EDIT_NOTIFICATION: 'Edit Notification',
    DELETE_NOTIFICATION: 'Delete Notification',

    // Coupon-related permissions
    MANAGE_COUPON: 'Manage Coupon',
    CREATE_COUPON: 'Create Coupon',
    EDIT_COUPON: 'Edit Coupon',
    DELETE_COUPON: 'Delete Coupon',

    // Plan-related permissions
    MANAGE_PLAN: 'Manage Plan',
    CREATE_PLAN: 'Create Plan',
    EDIT_PLAN: 'Edit Plan',
    BUY_PLAN: 'Buy Plan',

    // Order-related permissions
    MANAGE_ORDER: 'Manage Order'
};

module.exports = PERMISSIONS;
