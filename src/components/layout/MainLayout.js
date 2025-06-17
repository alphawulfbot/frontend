"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const Header_1 = __importDefault(require("./Header"));
const Footer_1 = __importDefault(require("./Footer"));
const MainLayout = ({ children }) => {
    return (<div className="min-h-screen flex flex-col">
      <Header_1.default />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children || <react_router_dom_1.Outlet />}
      </main>
      <Footer_1.default />
    </div>);
};
exports.default = MainLayout;
