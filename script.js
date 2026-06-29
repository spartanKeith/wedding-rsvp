/*
  Jonathan & Colyn Wedding RSVP Website
  Replace APPS_SCRIPT_URL with your deployed Google Apps Script Web App URL.
*/

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBCetK4lCxTckthtPa_b2lPW1PK24i_rNFgGHhlOR84wG0FOSzPIpit1SGLeyOINjr8Q/exec";
const WEDDING_DATE = new Date("2026-08-21T15:00:00+08:00");

/* Image fallback support */
document.querySelectorAll(".js-fallback-img").forEach(img => {
  img.addEventListener("error", () => {
    const fallback = img.dataset.fallbackSrc;

    if (fallback && img.src.indexOf(fallback) === -1) {
      img.src = fallback;
    } else {
      img.style.display = "none";
    }
  });
});

/* Invitation gate */
document.body.classList.add("no-scroll");

const gate = document.getElementById("gate");
const openInviteBtn = document.getElementById("openInviteBtn");

if (gate && openInviteBtn) {
  openInviteBtn.addEventListener("click", () => {
    gate.classList.add("hidden");
    document.body.classList.remove("no-scroll");

    // Direct to homepage/countdown section after opening invitation
    const homeSection = document.getElementById("home");

    if (homeSection) {
      setTimeout(() => {
        homeSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 200);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  });
}

/* Mobile menu */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}

/* Countdown */
function updateCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const now = new Date();
  const diff = Math.max(WEDDING_DATE - now, 0);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = days;
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* Reveal animation */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach(el => {
  revealObserver.observe(el);
});

/* FAQ */
const faqButtons = document.querySelectorAll(".faq-item");

faqButtons.forEach(button => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    if (!answer) return;

    const isOpen = answer.classList.contains("open");

    document.querySelectorAll(".faq-answer.open").forEach(openAnswer => {
      openAnswer.classList.remove("open");
    });

    document.querySelectorAll(".faq-item strong").forEach(icon => {
      icon.textContent = "+";
    });

    if (!isOpen) {
      answer.classList.add("open");

      const icon = button.querySelector("strong");
      if (icon) icon.textContent = "−";
    }
  });
});

/* Attendance logic */
const attendance = document.getElementById("attendance");
const guestCount = document.getElementById("guestCount");

if (attendance && guestCount) {
  attendance.addEventListener("change", () => {
    if (attendance.value === "Not Attending") {
      guestCount.value = 0;
      guestCount.min = 0;
    } else {
      guestCount.min = 1;

      if (Number(guestCount.value) < 1) {
        guestCount.value = 1;
      }
    }
  });
}

/* RSVP Form */
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

if (form && statusEl && submitBtn) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submittedAtInput = document.getElementById("submittedAt");
    if (submittedAtInput) {
      submittedAtInput.value = new Date().toISOString();
    }

    const formData = new FormData(form);

    /*
      Field name normalizer:
      This makes sure data will still submit even if your HTML uses old names.
    */
    if (!formData.get("fullName") && formData.get("name")) {
      formData.set("fullName", formData.get("name"));
    }

    if (!formData.get("mobileNumber") && formData.get("mobile")) {
      formData.set("mobileNumber", formData.get("mobile"));
    }

    if (!formData.get("attendance") && formData.get("attending")) {
      formData.set("attendance", formData.get("attending"));
    }

    if (!formData.get("guestCount") && formData.get("guests")) {
      formData.set("guestCount", formData.get("guests"));
    }

    if (!formData.get("mealPreference") && formData.get("meal")) {
      formData.set("mealPreference", formData.get("meal"));
    }

    const payload = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    statusEl.textContent = "";

    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
        console.table(payload);
        localStorage.setItem("lastWeddingRSVP", JSON.stringify(payload));
        statusEl.textContent = "Test mode: RSVP saved in this browser only.";
        form.reset();
        return;
      }

      const body = new URLSearchParams();

      formData.forEach((value, key) => {
        body.append(key, value);
      });

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: body
      });

      statusEl.textContent = "Thank you! Your RSVP has been submitted.";
      form.reset();

    } catch (error) {
      console.error(error);
      statusEl.textContent = "Sorry, something went wrong. Please try again or contact the coordinator.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit RSVP";
    }
  });
}

/* Copy hashtag */
const copyHashtag = document.getElementById("copyHashtag");

if (copyHashtag) {
  copyHashtag.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("#IanNaAngGodsColyn");
      copyHashtag.textContent = "Copied!";

      setTimeout(() => {
        copyHashtag.textContent = "Copy #IanNaAngGodsColyn";
      }, 1800);

    } catch (error) {
      copyHashtag.textContent = "#IanNaAngGodsColyn";
    }
  });
}

const copyGcash = document.getElementById("copyGcash");
const gcashNumber = document.getElementById("gcashNumber");
const gcashCopyStatus = document.getElementById("gcashCopyStatus");

if (copyGcash && gcashNumber && gcashCopyStatus) {
  copyGcash.addEventListener("click", async () => {
    const numberToCopy = gcashNumber.textContent.trim();

    try {
      await navigator.clipboard.writeText(numberToCopy);

      copyGcash.textContent = "Copied!";
      gcashCopyStatus.textContent = "GCash number copied.";

      setTimeout(() => {
        copyGcash.textContent = "Copy";
        gcashCopyStatus.textContent = "Tap copy to copy the GCash number.";
      }, 1800);

    } catch (error) {
      gcashCopyStatus.textContent = `Please copy manually: ${numberToCopy}`;
    }
  });
}