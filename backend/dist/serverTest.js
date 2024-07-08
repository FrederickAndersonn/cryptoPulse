"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const userDetailsRoutes_1 = __importDefault(require("./routes/userDetailsRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const loginRoutes_1 = __importDefault(require("./routes/loginRoutes"));
const walletDetailsRoutes_1 = __importDefault(require("./routes/walletDetailsRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const TEST_DB_URL = "mongodb+srv://public:public@cluster0.jcpik0t.mongodb.net/cryptoPulse_Test";
mongoose_1.default.connect(TEST_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Test Database connected!"))
    .catch(err => console.error("Test Database connection error:", err));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "build")));
app.use("/register", userRoutes_1.default);
app.use("/login", loginRoutes_1.default);
app.use("/wallet", walletDetailsRoutes_1.default);
app.use("/", postRoutes_1.default);
app.use("/comment", commentRoutes_1.default);
app.use("/user", userDetailsRoutes_1.default);
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
    console.log("CryptoPulse test server has started on port", PORT);
});
exports.server = server;
