const bcrypt = require("bcryptjs");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getRegister = (_, res) => {
  res.render("auth/register", { title: "Register", error: null });
};

exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).render("auth/register", {
      title: "Register",
      error: "Password and Confirm Password do not match",
    });
  }
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).render("auth/register", {
        title: "Register",
        error: "Email already in use",
      });
    }
    // Find the User role
    const userRole = await prisma.role.findUnique({
      where: { name: "User" },
    });

    if (!userRole) {
      return res.status(500).render("auth/register", {
        title: "Register",
        error: "User role not found. Please contact admin.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: { connect: { id: userRole.id } },
      },
    });
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("An error occurred during registration");
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login", { title: "login", error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
  if (!user) {
    return res.status(401).render("auth/login", {
      title: "login",
      error: "Email not found",
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).render("auth/login", {
      title: "login",
      error: "Incorrect password",
    });
  }
  if (user && isMatch) {
    req.session.userId = user.id;
    req.session.name = user.name;
    req.session.role = user.role.name;
    return res.redirect("/");
  }
  // Redirect based on role
  if (user.role.name === "Admin") {
    return res.redirect("/index.html");
  } else {
    return res.redirect("/auth/login");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
