const session = require("express-session");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime.js");
dayjs.extend(relativeTime);

const fs = require("fs");
const path = require("path");

exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        lostItems: true,
        foundItems: true,
      },
    });

    // Build activity log
    let activities = [];

    // Found items posted
    user.foundItems.forEach((item) => {
      activities.push({
        id: item.id,
        type: "found",
        title: "Posted a found item",
        description: `${item.title} found at ${item.foundLocation}`,
        timeAgo: dayjs(item.createdAt).fromNow(),
        createdAt: item.createdAt,
      });
    });

    // Lost items posted
    user.lostItems.forEach((item) => {
      activities.push({
        id: item.id,
        type: "lost",
        title: "Reported a lost item",
        description: `${item.title} lost at ${item.lostLocation}`,
        timeAgo: dayjs(item.createdAt).fromNow(),
        createdAt: item.createdAt,
      });
    });

    // Sort by newest activity first
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // format createdAt date
    const createdAt = new Date(user.createdAt);
    const options = { year: "numeric", month: "short" };
    const formattedDate = createdAt.toLocaleDateString("en-US", options);

    // format phone number helper function
    function formatPhone(phone) {
      if (!phone) return "-";
      let digits = phone.replace(/\s+/g, "").replace(/-/g, ""); // remove any existing spaces
      if (digits.startsWith("0")) digits = "+95" + digits.slice(1); // replace leading 0 with +95 (Myanmar country code)
      // format mobile numbers starting with +959
      if (/^\+959\d{7,9}$/.test(digits)) {
        let parts = [
          digits.slice(0, 3), // +95
          digits.slice(3, 4), // 9
          digits.slice(4, 7), // XXX
          digits.slice(7, 10), // XXX
          digits.slice(10), // rest
        ].filter(Boolean);
        return parts.join(" ");
      }

      // format landline numbers (e.g., +951XXXXXX or +951XXXXXXX)
      if (/^\+95[1-9]\d{5,7}$/.test(digits)) {
        let parts = [
          digits.slice(0, 3), // +95
          digits.slice(3, 4), // region code
          digits.slice(4, 7), // XXX
          digits.slice(7), // rest
        ].filter(Boolean);
        return parts.join(" ");
      }
      return digits; // fallback if format unexpected
    }

    const formattedPhone = formatPhone(user.phone);

    // calculate profile completion %
    const hasName =
      user.name && user.name.trim() !== "-" && user.name.trim() !== "";
    const hasEmail =
      user.email && user.email.trim() !== "-" && user.email.trim() !== "";
    const hasPhone =
      user.phone && user.phone.trim() !== "-" && user.phone.trim() !== "";
    const hasAddress =
      user.address && user.address.trim() !== "-" && user.address.trim() !== "";
    const hasCity =
      user.city && user.city.trim() !== "-" && user.city.trim() !== "";
    const hasRegion =
      user.region && user.region.trim() !== "-" && user.region.trim() !== "";
    const hasCountry =
      user.country && user.country.trim() !== "-" && user.country.trim() !== "";

    const totalFields = 7;
    const filledFields = [
      hasName,
      hasEmail,
      hasPhone,
      hasAddress,
      hasCity,
      hasRegion,
      hasCountry,
    ].filter(Boolean).length;

    // Calculate raw progress
    let progress = (filledFields / totalFields) * 100;

    // Round to nearest 5
    progress = Math.round(progress / 5) * 5;

    // Between 0 and 100
    progress = Math.max(0, Math.min(100, progress));

    res.render("user/profile", {
      user,
      userId: req.session.userId,
      formattedDate,
      formattedPhone,
      progress,
      activities,
      title: "Profile",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        lostItems: true,
        foundItems: true,
      },
    });

    if (!user) {
      return res.status(404).render("404", { message: "User not found" });
    }

    // Build activity log
    let activities = [];

    // Found items posted
    user.foundItems.forEach((item) => {
      activities.push({
        id: item.id,
        type: "found",
        title: "Posted a found item",
        description: `${item.title} found at ${item.foundLocation}`,
        timeAgo: dayjs(item.createdAt).fromNow(),
        createdAt: item.createdAt,
      });
    });

    // Lost items posted
    user.lostItems.forEach((item) => {
      activities.push({
        id: item.id,
        type: "lost",
        title: "Reported a lost item",
        description: `${item.title} lost at ${item.lostLocation}`,
        timeAgo: dayjs(item.createdAt).fromNow(),
        createdAt: item.createdAt,
      });
    });

    // Sort by newest activity first
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // format createdAt date
    const createdAt = new Date(user.createdAt);
    const options = { year: "numeric", month: "short" };
    const formattedDate = createdAt.toLocaleDateString("en-US", options);

    // format phone number helper function
    function formatPhone(phone) {
      if (!phone) return "-";
      let digits = phone.replace(/\s+/g, "").replace(/-/g, ""); // remove any existing spaces
      if (digits.startsWith("0")) digits = "+95" + digits.slice(1); // replace leading 0 with +95 (Myanmar country code)
      // format mobile numbers starting with +959
      if (/^\+959\d{7,9}$/.test(digits)) {
        let parts = [
          digits.slice(0, 3), // +95
          digits.slice(3, 4), // 9
          digits.slice(4, 7), // XXX
          digits.slice(7, 10), // XXX
          digits.slice(10), // rest
        ].filter(Boolean);
        return parts.join(" ");
      }

      // format landline numbers (e.g., +951XXXXXX or +951XXXXXXX)
      if (/^\+95[1-9]\d{5,7}$/.test(digits)) {
        let parts = [
          digits.slice(0, 3), // +95
          digits.slice(3, 4), // region code
          digits.slice(4, 7), // XXX
          digits.slice(7), // rest
        ].filter(Boolean);
        return parts.join(" ");
      }
      return digits; // fallback if format unexpected
    }

    const formattedPhone = formatPhone(user.phone);

    const publicUser = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      region: user.region,
      country: user.country,
      avatar: user.avatar,
      createdAt: user.createdAt,
      verified: user.verified,
      lostItems: user.lostItems,
      foundItems: user.foundItems,
    };

    res.render("user/view", {
      user: publicUser,
      formattedDate,
      formattedPhone,
      activities,
      title: `${user.name}'s Profile`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!user || user.id !== req.session.userId) {
      return res.redirect("/profile");
    }
    res.render("user/logout", { user, title: "Logout", error: null });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getEditUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!user || user.id !== req.session.userId) {
      return res.redirect("/profile");
    }
    res.render("user/edit", { user, title: "Edit Profile", error: null });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.editUserInfo = async (req, res) => {
  const { id } = req.params;

  if (req.session.userId !== id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const { name, email, phone, address, city, region, country } = req.body;
    // Get current user to access existing avatar
    const existingUser = await prisma.user.findUnique({ where: { id } });
    // const avatar = req.file ? req.file.filename : existingUser.avatar;
    let avatar = existingUser.avatar;

    if (req.file) {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).render("user/edit", {
          user: existingUser,
          title: "Edit Profile",
          error: "Invalid image format. Only JPG, PNG, and GIF are allowed.",
        });
      }

      try {
        // Delete old avatar file if it exists
        const fs = require("fs");
        const path = require("path");

        if (existingUser.avatar && typeof existingUser.avatar === "string") {
          const oldAvatarPath = path.join(
            __dirname,
            "../public/uploads/avatar",
            existingUser.avatar
          );

          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath); // delete old avatar
          }
        }

        avatar = req.file.filename; // Set new filename
      } catch (fileError) {
        console.error("Error processing avatar file:", fileError);
        return res.status(500).render("user/edit", {
          user: existingUser,
          title: "Edit Profile",
          error: "Failed to process profile picture. Please try again.",
        });
      }
    }

    let normalizedPhone = "";

    if (phone && phone.trim() !== "") {
      normalizedPhone = phone.trim().replace(/[^\d+]/g, "");

      if (/^09\d{7,10}$/.test(normalizedPhone)) {
        // already valid
      } else if (/^959\d{7,10}$/.test(normalizedPhone)) {
        normalizedPhone = "0" + normalizedPhone.slice(2);
      } else if (/^\+959\d{7,10}$/.test(normalizedPhone)) {
        normalizedPhone = "0" + normalizedPhone.slice(3);
      } else {
        return res.status(400).send("Invalid phone number format");
      }
    }

    if (
      (!email || email.trim() === "") &&
      (!normalizedPhone || normalizedPhone.trim() === "")
    ) {
      return res.status(400).render("user/edit", {
        user: existingUser,
        title: "Edit Profile",
        error: "Please provide at least an email address or a phone number.",
      });
    }

    // check for duplicate phone number
    if (normalizedPhone) {
      const userWithSamePhone = await prisma.user.findFirst({
        where: {
          phone: normalizedPhone,
          AND: {
            id: { not: id },
          }, // exclude current user
        },
      });

      if (userWithSamePhone) {
        return res.status(400).render("user/edit", {
          user: existingUser,
          title: "Edit Profile",
          error: "This phone number is already in use by another account.",
        });
      }
    }

    const updateData = {
      name,
      email,
      phone: normalizedPhone,
      address,
      city,
      region,
      country,
    };

    if (avatar) {
      updateData.avatar = avatar;
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    res.redirect("/user/profile");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getDeleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        lostItems: true,
        foundItems: true,
      },
    });
    if (!user || user.id !== req.session.userId) {
      return res.redirect("/profile");
    }
    res.render("user/delete", { user, title: "Delete Account", error: null });
  } catch (error) {
    console.error("Error in getDeleteUser:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.postDeleteUser = async (req, res) => {
  const { confirmPassword, deleteConfirmation } = req.body;
  const { id } = req.params;

  const { promises: fs } = require("fs");
  const path = require("path");

  if (req.session.userId !== id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        lostItems: true,
        foundItems: true,
      },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check DELETE confirmation text
    if (deleteConfirmation !== "DELETE") {
      return res.render("user/delete", {
        user,
        title: "Delete Account",
        error: "You must type DELETE exactly to confirm.",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(confirmPassword, user.password);
    if (!passwordMatch) {
      return res.render("user/delete", {
        user,
        title: "Delete Account",
        error: "Incorrect password.",
      });
    }

    // Delete avatar if it exists
    // if (user.avatar) {
    //   const avatarPath = path.join(
    //     __dirname,
    //     "../public/uploads/avatar",
    //     user.avatar
    //   );
    //   if (fs.existsSync(avatarPath)) {
    //     fs.unlinkSync(avatarPath);
    //   }
    // }
    // Collect all file paths to delete
    const filesToDelete = [];

    if (user.avatar) {
      filesToDelete.push(
        path.join(__dirname, "../public/uploads/avatar", user.avatar)
      );
    }

    user.lostItems.forEach((item) => {
      (item.images || []).forEach((img) =>
        filesToDelete.push(
          path.join(__dirname, "../public/uploads/lost-items", img)
        )
      );
    });

    user.foundItems.forEach((item) => {
      (item.images || []).forEach((img) =>
        filesToDelete.push(
          path.join(__dirname, "../public/uploads/found-items", img)
        )
      );
    });

    // Delete user from DB
    // await prisma.user.delete({
    //   where: { id },
    // });

    // Delete from DB in bulk – uses deleteMany instead of looping.
    await prisma.$transaction([
      prisma.lostItem.deleteMany({ where: { userId: id } }),
      prisma.foundItem.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    // Delete files asynchronously (non-blocking) – no blocking the event loop.
    await Promise.all(
      filesToDelete.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
        } catch (err) {
          if (err.code !== "ENOENT") console.error("File delete error:", err);
        }
      })
    );

    // Destroy session after deletion
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).send("Failed to log out after deletion");
      }
      res.redirect("/");
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
};
