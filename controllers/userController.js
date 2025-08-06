const session = require("express-session");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

const fs = require("fs");
const path = require("path");

exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

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
      formattedDate,
      formattedPhone,
      progress,
      title: "Profile",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
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

exports.delete = async (req, res) => {
  const { id } = req.params;

  if (req.session.userId !== id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Delete avatar if it exists
    if (user.avatar) {
      const avatarPath = path.join(
        __dirname,
        "../public/uploads/avatar",
        user.avatar
      );
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Delete user from DB
    await prisma.user.delete({
      where: { id },
    });

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
