const users = require('./users');


/* add */
const products = require('./products/');
const bills = require('./bills/');
const customers = require('./customers/');
const iservices = require('./iservices');
const orders = require('./orders');
const payments = require('./payments');
const points = require('./points');
const purchases = require('./purchases/');
const serials = require('./serials/');

const regions = require('./regions/');
const subregions = require('./subregions/');
const departments = require('./departments');
const companies = require('./companies/');
const offices = require('./offices/');
const suppliers = require('./suppliers/');
const categories = require('./categories/');

const warehouseReceipts = require('./warehouse_receipts');
const warehouses = require('./warehouses');
const productLogs = require('./product_logs');
const vatInvoices = require('./vat_invoices');
const levels = require('./levels');
const userLogs = require('./user_logs');
const billAccounts = require('./bill_accounts');

const credits = require('./credits');
const stores = require('./stores');
const units = require('./units/');


const deleteReasons = require('./delete_reasons/');
const transporters = require('./transporters/');
const customerTypes = require('./customer_types/');
const customerStatus = require('./customer_status');
const customerOrginals = require('./customer_orginals');
const roles = require('./roles');
const groupUsers = require('./group_users');
const userRoles = require('./user_roles');


const notifications = require('./notifications');


const groups = require('./groups/groups.service.js');
const coupons = require('./coupons')


// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(offices);
  app.configure(companies);
  app.configure(departments);
  app.configure(regions);
  app.configure(subregions);
  app.configure(purchases);

  app.configure(products);
  app.configure(bills);
  app.configure(customers);
  app.configure(iservices);
  app.configure(orders);
  app.configure(payments);
  app.configure(points);
  app.configure(serials);


  app.configure(suppliers);
  app.configure(categories);

  app.configure(warehouseReceipts);
  app.configure(warehouses);
  app.configure(productLogs);
  app.configure(vatInvoices);
  app.configure(levels);
  app.configure(userLogs);
  app.configure(billAccounts);
  app.configure(credits);
  app.configure(stores);
  app.configure(units);
  app.configure(deleteReasons);
  app.configure(transporters);
  app.configure(customerTypes);
  app.configure(customerStatus);
  app.configure(customerOrginals);
  app.configure(roles);
  app.configure(groupUsers);
  app.configure(userRoles);
  app.configure(notifications);
  app.configure(groups);

  app.configure(coupons)
};
