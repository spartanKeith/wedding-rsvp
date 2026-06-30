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

    if (typeof playWeddingMusic === "function") {
      playWeddingMusic();
    }

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

/* RSVP Form - Updated for New RSVP Fields */
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

if (form && statusEl && submitBtn) {
  const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
  const guest1 = document.getElementById("guest1");
  const guest2 = document.getElementById("guest2");
  const mealRadios = form.querySelectorAll('input[name="mealPreference"]');

  function updateGuestFields() {
    const selectedAttendance = form.querySelector('input[name="attendance"]:checked')?.value;

    if (selectedAttendance === "Regretfully Declines") {
      if (guest1) {
        guest1.value = "";
        guest1.disabled = true;
        guest1.required = false;
      }

      if (guest2) {
        guest2.value = "";
        guest2.disabled = true;
        guest2.required = false;
      }

      mealRadios.forEach(radio => {
        radio.checked = false;
        radio.disabled = true;
      });

      form.classList.add("disabled-guest-fields");
    } else if (selectedAttendance === "Joyfully Accepts") {
      if (guest1) {
        guest1.disabled = false;
        guest1.required = true;
      }

      if (guest2) {
        guest2.disabled = false;
        guest2.required = false;
      }

      mealRadios.forEach(radio => {
        radio.disabled = false;
      });

      form.classList.remove("disabled-guest-fields");
    } else {
      if (guest1) {
        guest1.disabled = false;
        guest1.required = false;
      }

      if (guest2) {
        guest2.disabled = false;
        guest2.required = false;
      }

      mealRadios.forEach(radio => {
        radio.disabled = false;
      });

      form.classList.remove("disabled-guest-fields");
    }
  }

  attendanceRadios.forEach(radio => {
    radio.addEventListener("change", updateGuestFields);
  });

  updateGuestFields();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submittedAtInput = document.getElementById("submittedAt");

    if (submittedAtInput) {
      submittedAtInput.value = new Date().toISOString();
    }

    const formData = new FormData(form);

    /*
      Make sure all expected Apps Script fields are sent,
      even if some fields are disabled or blank.
    */
    const selectedAttendance = form.querySelector('input[name="attendance"]:checked')?.value || "";
    const selectedMeal = form.querySelector('input[name="mealPreference"]:checked')?.value || "";

    formData.set("fullName", document.getElementById("fullName")?.value || "");
    formData.set("mobileNumber", document.getElementById("mobileNumber")?.value || "");
    formData.set("email", document.getElementById("email")?.value || "");
    formData.set("attendance", selectedAttendance);
    formData.set("reservedSeats", document.getElementById("reservedSeats")?.value || "2");
    formData.set("guest1", guest1?.value || "");
    formData.set("guest2", guest2?.value || "");
    formData.set("mealPreference", selectedMeal);
    formData.set("message", document.getElementById("message")?.value || "");
    formData.set("submittedAt", submittedAtInput?.value || new Date().toISOString());

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    statusEl.textContent = "";

    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
        const payload = Object.fromEntries(formData.entries());
        console.table(payload);
        localStorage.setItem("lastWeddingRSVP", JSON.stringify(payload));
        statusEl.textContent = "Test mode: RSVP saved in this browser only.";
        form.reset();
        updateGuestFields();
        return;
      }

      const body = new URLSearchParams();

      formData.forEach((value, key) => {
        body.append(key, value);
      });

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: body.toString()
      });

      statusEl.textContent = "Thank you! Your RSVP has been submitted.";
      form.reset();
      updateGuestFields();

    } catch (error) {
      console.error("RSVP submit error:", error);
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

/* Copy GCash Number */
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

/* Music Image Button */
const bgMusic = document.getElementById("bgMusic");
const musicImageBtn = document.getElementById("musicImageBtn");
const musicImageBox = document.getElementById("musicImageBox");
const musicStatusIcon = document.getElementById("musicStatusIcon");

let isWeddingMusicPlaying = false;

async function playWeddingMusic() {
  if (!bgMusic || !musicImageBox || !musicStatusIcon) return;

  try {
    bgMusic.volume = 0.45;
    await bgMusic.play();

    isWeddingMusicPlaying = true;
    musicImageBox.classList.add("playing");
    musicStatusIcon.textContent = "❚❚";
  } catch (error) {
    console.log("Autoplay blocked or music not ready:", error);
    isWeddingMusicPlaying = false;
    musicImageBox.classList.remove("playing");
    musicStatusIcon.textContent = "▶";
  }
}

function pauseWeddingMusic() {
  if (!bgMusic || !musicImageBox || !musicStatusIcon) return;

  bgMusic.pause();

  isWeddingMusicPlaying = false;
  musicImageBox.classList.remove("playing");
  musicStatusIcon.textContent = "▶";
}

if (musicImageBtn) {
  musicImageBtn.addEventListener("click", () => {
    if (isWeddingMusicPlaying) {
      pauseWeddingMusic();
    } else {
      playWeddingMusic();
    }
  });
}

/* Full View Image / Lightbox */
document.addEventListener("DOMContentLoaded", () => {
  const imageLightbox = document.getElementById("imageLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxClose = document.getElementById("lightboxClose");

  if (!imageLightbox || !lightboxImage || !lightboxTitle || !lightboxClose) {
    console.warn("Lightbox elements are missing. Please add the lightbox HTML before script.js.");
    return;
  }

  function openImageLightbox(img) {
    const imageSrc = img.getAttribute("src");
    const imageAlt = img.getAttribute("alt") || "Full view image";
    const imageTitle = img.getAttribute("data-title") || imageAlt;

    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt;
    lightboxTitle.textContent = imageTitle;

    imageLightbox.classList.add("open");
    document.body.classList.add("lightbox-no-scroll");
  }

  function closeImageLightbox() {
    imageLightbox.classList.remove("open");
    document.body.classList.remove("lightbox-no-scroll");

    setTimeout(() => {
      lightboxImage.src = "";
      lightboxImage.alt = "";
      lightboxTitle.textContent = "";
    }, 150);
  }

  document.addEventListener("click", (event) => {
    const clickedImage = event.target.closest(".full-view-img");

    if (clickedImage) {
      openImageLightbox(clickedImage);
      return;
    }

    if (event.target === imageLightbox) {
      closeImageLightbox();
    }
  });

  lightboxClose.addEventListener("click", closeImageLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && imageLightbox.classList.contains("open")) {
      closeImageLightbox();
    }
  });
});