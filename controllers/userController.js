const session = require("express-session");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getuser = async (req, res) => {
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
    let progress = 0;

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

    if (hasEmail) {
      progress = 33;
    }

    if (hasEmail && hasPhone) {
      progress = 66;
    }

    if (hasEmail && hasPhone && hasAddress && hasCity && hasRegion) {
      progress = 100;

      if (!user.verified) {
        // update verified
        await prisma.user.update({
          where: { id: user.id },
          data: { verified: true },
        });

        user.verified = true;
      }
    }

    res.render("user/profile", {
      user,
      formattedDate,
      formattedPhone,
      progress,
      title: "profile",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
