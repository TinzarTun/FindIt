const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const authMiddleware = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lostItemRoutes = require("./routes/lostItemRoutes");
const foundItemRoutes = require("./routes/foundItemRoutes");
// const claimRoutes = require("./routes/claimRoutes");
const indexRoutes = require("./routes/indexRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(
  session({
    secret: process.env.SECRET || "default-secret", // fallback in case env is missing
    resave: false, // FIX: no warning for resave
    saveUninitialized: false, // FIX: no warning for saveUninitialized
  })
);
app.use(expressLayouts); // layout.ejs
app.use((req, res, next) => {
  res.locals.userId = req.session.userId; // pass userId to ejs
  res.locals.role = req.session.role; // pass role to ejs
  next();
});

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/user", authMiddleware, userRoutes);
app.use("/lost", authMiddleware, lostItemRoutes);
app.use("/found", authMiddleware, foundItemRoutes);
// app.use("/claim", authMiddleware, claimRoutes);
app.use("/categories", categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
